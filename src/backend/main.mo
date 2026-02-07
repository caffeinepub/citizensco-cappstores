import AccessControl "authorization/access-control";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Stripe "stripe/stripe";



actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    email : ?Text;
    preferences : [Text];
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type ProjectEntry = {
    id : Text;
    name : Text;
    description : Text;
    url : Text;
    category : Text;
    logo : Storage.ExternalBlob;
    revenueShareConfigId : ?Text;
  };

  let projectEntries = Map.empty<Text, ProjectEntry>();

  type AnalyticsEntry = {
    projectId : Text;
    clicks : Nat;
    views : Nat;
  };

  let analyticsData = Map.empty<Text, AnalyticsEntry>();

  type RevenueShareParticipant = {
    principal : ?Principal;
    stripeId : ?Text;
    percentage : Nat;
  };

  type RevenueShareConfig = {
    id : Text;
    participants : [RevenueShareParticipant];
  };

  let revenueShareConfigs = Map.empty<Text, RevenueShareConfig>();

  let recommendations = Map.empty<Principal, [Text]>();

  let stripeSessions = Map.empty<Text, Principal>();

  type Wallet = {
    icpBalance : Nat;
    stripeBalance : Nat;
    transactionHistory : [Text];
  };

  let wallets = Map.empty<Principal, Wallet>();

  type RewardCampaignType = {
    #airdrop;
    #bonus;
    #commission;
    #contest;
    #earning;
    #education;
    #referral;
    #reward;
    #special;
    #volunteer;
    #workshop;
  };

  type RewardCampaign = {
    id : Text;
    name : Text;
    campaignType : RewardCampaignType;
    rewardAmount : Nat;
    description : Text;
    participants : [Principal];
  };

  let rewardCampaigns = Map.empty<Text, RewardCampaign>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addProjectEntry(entry : ProjectEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add project entries");
    };
    projectEntries.add(entry.id, entry);
    let initialAnalytics : AnalyticsEntry = {
      projectId = entry.id;
      clicks = 0;
      views = 0;
    };
    analyticsData.add(entry.id, initialAnalytics);
  };

  public query ({ caller }) func getProjectEntries() : async [ProjectEntry] {
    projectEntries.values().toArray();
  };

  public shared ({ caller }) func trackProjectClick(projectId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can track clicks");
    };

    withAnalyticsEntry(
      projectId,
      func(existing) {
        {
          projectId = existing.projectId;
          clicks = existing.clicks + 1;
          views = existing.views;
        };
      },
      func() {
        {
          projectId = projectId;
          clicks = 1;
          views = 0;
        };
      },
    );
  };

  public shared ({ caller }) func trackProjectView(projectId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can track views");
    };

    withAnalyticsEntry(
      projectId,
      func(existing) {
        {
          projectId = existing.projectId;
          clicks = existing.clicks;
          views = existing.views + 1;
        };
      },
      func() {
        {
          projectId = projectId;
          clicks = 0;
          views = 1;
        };
      },
    );
  };

  func withAnalyticsEntry(
    projectId : Text,
    update : AnalyticsEntry -> AnalyticsEntry,
    create : () -> AnalyticsEntry,
  ) {
    switch (analyticsData.get(projectId)) {
      case (null) {
        analyticsData.add(projectId, create());
      };
      case (?existing) {
        analyticsData.add(projectId, update(existing));
      };
    };
  };

  public query ({ caller }) func getAnalytics(projectId : Text) : async ?AnalyticsEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    analyticsData.get(projectId);
  };

  public query ({ caller }) func getAllAnalytics() : async [AnalyticsEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    analyticsData.values().toArray();
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check Stripe configuration");
    };
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };

    let configuration = switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe configuration is not set") };
      case (?config) { config };
    };

    let sessionId = await Stripe.createCheckoutSession(
      configuration,
      caller,
      items,
      successUrl,
      cancelUrl,
      transform,
    );

    stripeSessions.add(sessionId, caller);

    sessionId;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (stripeSessions.get(sessionId)) {
      case (null) {
        Runtime.trap("Session not found");
      };
      case (?owner) {
        if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own payment sessions");
        };
      };
    };

    let configuration = switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe configuration is not set") };
      case (?config) { config };
    };
    await Stripe.getSessionStatus(configuration, sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createRevenueShareConfig(config : RevenueShareConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create revenue share configs");
    };
    revenueShareConfigs.add(config.id, config);
  };

  public shared ({ caller }) func updateRevenueShareConfig(config : RevenueShareConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update revenue share configs");
    };
    revenueShareConfigs.add(config.id, config);
  };

  public query ({ caller }) func getRevenueShareConfig(id : Text) : async ?RevenueShareConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view revenue share configs");
    };
    revenueShareConfigs.get(id);
  };

  public shared ({ caller }) func getWallet() : async ?Wallet {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wallets");
    };
    wallets.get(caller);
  };

  public shared ({ caller }) func depositToWallet(icpAmount : Nat, stripeAmount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deposit funds");
    };

    let transactionDescription = "Deposit: " # icpAmount.toText() # " ICP, " # stripeAmount.toText() # " Stripe";
    withWallet(
      caller,
      func(existing) {
        {
          icpBalance = existing.icpBalance + icpAmount;
          stripeBalance = existing.stripeBalance + stripeAmount;
          transactionHistory = existing.transactionHistory.concat([transactionDescription]);
        };
      },
      func() {
        {
          icpBalance = icpAmount;
          stripeBalance = stripeAmount;
          transactionHistory = [transactionDescription];
        };
      },
    );
  };

  public shared ({ caller }) func withdrawFromWallet(icpAmount : Nat, stripeAmount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can withdraw funds");
    };

    let transactionDescription = "Withdraw: " # icpAmount.toText() # " ICP, " # stripeAmount.toText() # " Stripe";
    switch (wallets.get(caller)) {
      case (null) { Runtime.trap("Wallet not found") };
      case (?wallet) {
        if (wallet.icpBalance < icpAmount or wallet.stripeBalance < stripeAmount) {
          Runtime.trap("Insufficient funds");
        };
        let updatedWallet = {
          icpBalance = wallet.icpBalance - icpAmount;
          stripeBalance = wallet.stripeBalance - stripeAmount;
          transactionHistory = wallet.transactionHistory.concat([transactionDescription]);
        };
        wallets.add(caller, updatedWallet);
      };
    };
  };

  func withWallet(
    owner : Principal,
    update : Wallet -> Wallet,
    create : () -> Wallet,
  ) {
    switch (wallets.get(owner)) {
      case (null) {
        wallets.add(owner, create());
      };
      case (?existing) {
        wallets.add(owner, update(existing));
      };
    };
  };

  public shared ({ caller }) func createRewardCampaign(campaign : RewardCampaign) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create reward campaigns");
    };
    rewardCampaigns.add(campaign.id, campaign);
  };

  public shared ({ caller }) func joinRewardCampaign(campaignId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join reward campaigns");
    };

    switch (rewardCampaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let updatedParticipants = campaign.participants.concat([caller]);
        let updatedCampaign = {
          campaign with
          participants = updatedParticipants;
        };
        rewardCampaigns.add(campaignId, updatedCampaign);
      };
    };
  };

  public shared ({ caller }) func completeRewardCampaign(campaignId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete reward campaigns");
    };

    switch (rewardCampaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let isParticipant = campaign.participants.find(func(p) { p == caller }) != null;
        if (not isParticipant) {
          Runtime.trap("You are not a participant in this campaign");
        };

        let transactionDescription = "Reward: " # campaign.name # " (" # campaign.rewardAmount.toText() # " ICP)";
        withWallet(
          caller,
          func(existing) {
            {
              icpBalance = existing.icpBalance + campaign.rewardAmount;
              stripeBalance = existing.stripeBalance;
              transactionHistory = existing.transactionHistory.concat([transactionDescription]);
            };
          },
          func() {
            {
              icpBalance = campaign.rewardAmount;
              stripeBalance = 0;
              transactionHistory = [transactionDescription];
            };
          },
        );
      };
    };
  };

  ///////////////////////////////
  ///
  /// E-commerce Extensions (multi-vendor support)
  ///
  ///////////////////////////////

  type Vendor = {
    id : Text;
    ownerPrincipal : Principal;
    displayName : Text;
    bio : Text;
    createdAt : Nat;
  };

  type Product = {
    id : Text;
    vendorId : Text;
    name : Text;
    description : Text;
    price : Nat;
    imageBlob : Storage.ExternalBlob;
    inventory : Nat;
    createdAt : Nat;
  };

  type OrderStatus = {
    #pending;
    #fulfilled;
    #declined;
    #cancelled;
  };

  type Order = {
    id : Text;
    buyerPrincipal : Principal;
    vendorId : Text;
    productId : Text;
    quantity : Nat;
    totalAmount : Nat;
    status : OrderStatus;
    createdAt : Nat;
  };

  let vendors = Map.empty<Text, Vendor>();
  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Text, Order>();
  let vendorBalances = Map.empty<Text, Nat>();

  // Vendor CRUD
  public shared ({ caller }) func createVendor(displayName : Text, bio : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create vendors");
    };

    let vendorId = caller.toText() # displayName # bio;

    let newVendor : Vendor = {
      id = vendorId;
      ownerPrincipal = caller;
      displayName;
      bio;
      createdAt = 0;
    };

    vendors.add(vendorId, newVendor);

    vendorBalances.add(vendorId, 0);

    vendorId;
  };

  public query ({ caller }) func getMyVendor() : async ?Vendor {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access their vendor");
    };
    vendors.values().find(
      func(vendor) {
        vendor.ownerPrincipal == caller;
      }
    );
  };

  public query ({ caller }) func getVendorById(id : Text) : async ?Vendor {
    // Public endpoint - no authorization required (browsing)
    vendors.get(id);
  };

  // Product CRUD
  public shared ({ caller }) func createProduct(
    vendorId : Text,
    name : Text,
    description : Text,
    price : Nat,
    imageBlob : Storage.ExternalBlob,
    inventory : Nat,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create products");
    };

    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        if (vendor.ownerPrincipal != caller) {
          Runtime.trap("Unauthorized: Only vendor owner can create products for this vendor");
        };

        let productId = vendorId # name;

        let newProduct : Product = {
          id = productId;
          vendorId;
          name;
          description;
          price;
          imageBlob;
          inventory;
          createdAt = 0;
        };

        products.add(productId, newProduct);

        productId;
      };
    };
  };

  public shared ({ caller }) func updateProduct(
    productId : Text,
    name : Text,
    description : Text,
    price : Nat,
    imageBlob : Storage.ExternalBlob,
    inventory : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        let vendorId = existingProduct.vendorId;
        switch (vendors.get(vendorId)) {
          case (null) { Runtime.trap("Vendor not found for product") };
          case (?vendor) {
            if (vendor.ownerPrincipal != caller) {
              Runtime.trap("Unauthorized: Only vendor owner can update products for this vendor");
            };

            let updatedProduct = {
              id = productId;
              vendorId;
              name;
              description;
              price;
              imageBlob;
              inventory;
              createdAt = existingProduct.createdAt;
            };

            products.add(productId, updatedProduct);
          };
        };
      };
    };
  };

  public query ({ caller }) func listProducts() : async [Product] {
    // Public endpoint - no authorization required (browsing)
    products.values().toArray();
  };

  public query ({ caller }) func listProductsByVendor(vendorId : Text) : async [Product] {
    // Public endpoint - no authorization required (browsing)
    products.values().toArray().filter(
      func(product) {
        product.vendorId == vendorId;
      }
    );
  };

  // Order CRUD
  public shared ({ caller }) func createOrder(vendorId : Text, productId : Text, quantity : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create orders");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (product.vendorId != vendorId) {
          Runtime.trap("Product does not belong to specified vendor");
        };

        if (product.inventory < quantity) {
          Runtime.trap("Not enough inventory for requested quantity");
        };

        let orderId = caller.toText() # vendorId # productId;
        let totalAmount = product.price * quantity;

        let newOrder : Order = {
          id = orderId;
          buyerPrincipal = caller;
          vendorId;
          productId;
          quantity;
          totalAmount;
          status = #pending;
          createdAt = 0;
        };

        orders.add(orderId, newOrder);

        let updatedProduct = {
          product with
          inventory = product.inventory - quantity
        };

        products.add(productId, updatedProduct);

        orderId;
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Text) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (caller != order.buyerPrincipal) {
          switch (vendors.get(order.vendorId)) {
            case (null) {
              if (not AccessControl.isAdmin(accessControlState, caller)) {
                Runtime.trap("Unauthorized: Only order owner or vendor can view order");
              };
            };
            case (?vendor) {
              if (vendor.ownerPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
                Runtime.trap("Unauthorized: Only order owner or vendor can view order");
              };
            };
          };
        };
        ?order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, newStatus : OrderStatus) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (vendors.get(order.vendorId)) {
          case (null) { Runtime.trap("Vendor not found for order") };
          case (?vendor) {
            if (vendor.ownerPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only vendor owner or admin can update order status");
            };

            let updatedOrder = {
              order with
              status = newStatus
            };

            orders.add(orderId, updatedOrder);
          };
        };
      };
    };
  };

  public query ({ caller }) func listMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };
    orders.values().toArray().filter(
      func(order) {
        order.buyerPrincipal == caller;
      }
    );
  };

  public query ({ caller }) func listOrdersByVendor(vendorId : Text) : async [Order] {
    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        if (vendor.ownerPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only vendor owner or admin can view vendor orders");
        };
      };
    };
    orders.values().toArray().filter(
      func(order) {
        order.vendorId == vendorId;
      }
    );
  };

  // Vendor earnings flows
  public shared ({ caller }) func creditVendor(vendorId : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can credit vendor balances");
    };

    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?_vendor) {
        let currentBalance = switch (vendorBalances.get(vendorId)) {
          case (null) { 0 };
          case (?existingBalance) { existingBalance };
        };

        vendorBalances.add(vendorId, currentBalance + amount);
      };
    };
  };

  public query ({ caller }) func getMyVendorBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their vendor balance");
    };

    switch (vendors.values().find(func(v) { v.ownerPrincipal == caller })) {
      case (null) { Runtime.trap("Vendor not found for caller") };
      case (?vendor) {
        switch (vendorBalances.get(vendor.id)) {
          case (null) { 0 };
          case (?balance) { balance };
        };
      };
    };
  };

  public shared ({ caller }) func withdrawVendorBalance(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can withdraw vendor balance");
    };

    switch (vendors.values().find(func(v) { v.ownerPrincipal == caller })) {
      case (null) { Runtime.trap("Vendor not found for caller") };
      case (?vendor) {
        switch (vendorBalances.get(vendor.id)) {
          case (null) { Runtime.trap("Vendor balance not found") };
          case (?balance) {
            if (balance < amount) {
              Runtime.trap("Not enough vendor balance to withdraw amount specified");
            };

            vendorBalances.add(vendor.id, balance - amount);

            withWallet(
              caller,
              func(existing) {
                {
                  icpBalance = existing.icpBalance + amount;
                  stripeBalance = existing.stripeBalance;
                  transactionHistory = existing.transactionHistory.concat(["Vendor earnings withdrawal: " # amount.toText()]);
                };
              },
              func() {
                {
                  icpBalance = amount;
                  stripeBalance = 0;
                  transactionHistory = ["Vendor earnings withdrawal: " # amount.toText()];
                };
              },
            );
          };
        };
      };
    };
  };
};
