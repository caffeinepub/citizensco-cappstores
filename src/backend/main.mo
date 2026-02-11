import AccessControl "authorization/access-control";
import Array "mo:core/Array";
import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Char "mo:core/Char";
import Stripe "stripe/stripe";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type UserProfile = {
    name : Text;
    email : ?Text;
    createdAt : Int;
  };

  func validateUserProfile(profile : UserProfile) : Bool {
    let nameLen = profile.name.trim(#char ' ').size();
    if (nameLen == 0 or nameLen < 2 or nameLen > 100) {
      return false;
    };

    type ValidationState = {
      #valid;
      #invalid;
    };

    func validateEmailState(email : Text, state : ValidationState) : ValidationState {
      switch (state) {
        case (#invalid) { #invalid };
        case (#valid) {
          let trimmedEmail = email.trim(#char ' ');
          let emailLen = trimmedEmail.size();
          if (emailLen < 5 or emailLen > 320) { return #invalid };

          if (trimmedEmail.size() == emailLen) {
            let parts = trimmedEmail.split(#char '@').toArray();
            if (parts.size() != 2) { return #invalid };
            let domain = parts[1];
            if (not domain.contains(#text ".")) { return #invalid };
            return #valid;
          };
          #invalid;
        };
      };
    };

    switch (profile.email, #valid : ValidationState) {
      case (null, _) { true };
      case (?email, state) {
        switch (validateEmailState(email, state)) {
          case (#valid) { true };
          case (#invalid) { false };
        };
      };
    };
  };

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

    let trimmedEmail = switch (profile.email) {
      case (null) { null };
      case (?email) { ?email.trim(#char ' ') };
    };

    let validatedProfile = {
      name = profile.name.trim(#char ' ');
      email = trimmedEmail;
      createdAt = Time.now();
    };

    if (not validateUserProfile(validatedProfile)) {
      Runtime.trap("Invalid user profile provided");
    };

    userProfiles.add(caller, validatedProfile);
  };

  public type RewardCampaignType = {
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

  public type RewardCampaign = {
    id : Text;
    name : Text;
    campaignType : RewardCampaignType;
    rewardAmount : Nat;
    description : Text;
    participants : [Principal];
  };

  var campaigns = Map.empty<Text, RewardCampaign>();

  let welcomeCampaign : RewardCampaign = {
    id = "uni_query";
    name = "Be a test user UNI_QUERY campaign";
    campaignType = #reward;
    rewardAmount = 2_000_000;
    description = "Welcome to Uniphore - Open Innovation by Inphinity";
    participants = [];
  };

  campaigns.add(welcomeCampaign.id, welcomeCampaign);

  public query ({ caller }) func getCampaignsState() : async {
    campaigns : [RewardCampaign];
    users : [UserProfile];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view campaigns state");
    };
    let campaignsList = campaigns.values().toArray();
    let usersList = userProfiles.values().toArray();
    {
      campaigns = campaignsList;
      users = usersList;
    };
  };

  public query ({ caller }) func getRewardCampaignsSample() : async [RewardCampaign] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view reward campaigns");
    };
    campaigns.values().toArray();
  };

  public shared ({ caller }) func createRewardCampaign(campaign : RewardCampaign) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create reward campaigns");
    };
    campaigns.add(campaign.id, campaign);
  };

  public shared ({ caller }) func joinRewardCampaign(campaignId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can join campaigns");
    };
    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let alreadyJoined = campaign.participants.find(func(p) { p == caller });
        if (alreadyJoined != null) {
          Runtime.trap("Already joined this campaign");
        };
        let updatedCampaign = {
          campaign with
          participants = campaign.participants.concat([caller]);
        };
        campaigns.add(campaignId, updatedCampaign);
      };
    };
  };

  public shared ({ caller }) func completeRewardCampaign(campaignId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can complete campaigns");
    };
    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let isParticipant = campaign.participants.find(func(p) { p == caller });
        if (isParticipant == null) {
          Runtime.trap("Must join campaign before completing");
        };
      };
    };
  };

  public type ProjectEntry = {
    id : Text;
    name : Text;
    description : Text;
    owner : Principal;
    views : Nat;
    clicks : Nat;
    createdAt : Int;
  };

  var projectEntries = Map.empty<Text, ProjectEntry>();

  public query ({ caller }) func listProjectEntries() : async [ProjectEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list project entries");
    };
    projectEntries.values().toArray();
  };

  public shared ({ caller }) func addProjectEntry(entry : ProjectEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add project entries");
    };
    projectEntries.add(entry.id, entry);
  };

  public shared ({ caller }) func trackProjectView(projectId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can track project views");
    };
    switch (projectEntries.get(projectId)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        let updated = {
          project with
          views = project.views + 1;
        };
        projectEntries.add(projectId, updated);
      };
    };
  };

  public shared ({ caller }) func trackProjectClick(projectId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can track project clicks");
    };
    switch (projectEntries.get(projectId)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        let updated = {
          project with
          clicks = project.clicks + 1;
        };
        projectEntries.add(projectId, updated);
      };
    };
  };

  public query ({ caller }) func getProjectAnalytics(projectId : Text) : async ?{
    views : Nat;
    clicks : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view project analytics");
    };
    switch (projectEntries.get(projectId)) {
      case (null) { null };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view analytics for your own projects");
        };
        ?{
          views = project.views;
          clicks = project.clicks;
        };
      };
    };
  };

  public type Vendor = {
    principalId : Principal;
    vendorOwner : Principal;
    displayName : Text;
    bio : Text;
    balance : Nat;
    createdAt : Int;
    published : Bool;
    categories : [Text];
  };

  type VendorsMap = Map.Map<Principal, Vendor>;
  type VendorsList = List.List<Vendor>;

  var vendors = Map.empty<Principal, Vendor>();

  public shared ({ caller }) func createVendor(displayName : Text, bio : Text, categories : [Text]) : async () {
    let vendor : Vendor = {
      principalId = caller;
      vendorOwner = caller;
      displayName;
      bio;
      balance = 0;
      createdAt = Time.now();
      published = false;
      categories = categories.map(normalizeCategory);
    };
    vendors.add(caller, vendor);
  };

  public shared ({ caller }) func publishVendor() : async () {
    switch (vendors.get(caller)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        let updatedVendor = { vendor with published = true };
        vendors.add(caller, updatedVendor);
      };
    };
  };

  public shared ({ caller }) func unpublishVendor() : async () {
    switch (vendors.get(caller)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        let updatedVendor = { vendor with published = false };
        vendors.add(caller, updatedVendor);
      };
    };
  };

  // Public query - no authentication required (for public vendor store pages)
  public query func getPublicVendor(vendorId : Principal) : async ?Vendor {
    switch (vendors.get(vendorId)) {
      case (null) { null };
      case (?vendor) {
        if (not vendor.published) {
          null;
        } else {
          ?vendor;
        };
      };
    };
  };

  // Public query - no authentication required (for vendor discovery)
  public query func listPublicVendors() : async [Vendor] {
    let publicVendors = vendors.values().toArray().filter(
      func(v) { v.published }
    );
    publicVendors;
  };

  // Public query - no authentication required (for vendor discovery by category)
  public query func listPublicVendorsByCategory(category : Text) : async [Vendor] {
    let normalizedCategory = normalizeCategory(category);

    let categorizedVendors = vendors.values().toArray().filter(
      func(v) {
        v.published and v.categories.find(
          func(cat) {
            cat == normalizedCategory;
          }
        ) != null
      }
    );
    categorizedVendors;
  };

  // New backend update endpoint for vendors
  public shared ({ caller }) func updateVendorProfile(displayName : Text, bio : Text, categories : [Text]) : async () {
    switch (vendors.get(caller)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        let updatedVendor = {
          vendor with
          displayName;
          bio;
          categories = categories.map(normalizeCategory);
        };
        vendors.add(caller, updatedVendor);
      };
    };
  };

  public query ({ caller }) func getVendor(vendorId : Principal) : async ?Vendor {
    switch (vendors.get(vendorId)) {
      case (null) { null };
      case (?vendor) {
        if ((vendor.vendorOwner != caller and not AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Only vendor owner or admin can view vendor details");
        };
        ?vendor;
      };
    };
  };

  public query ({ caller }) func getVendorBalance(vendorId : Principal) : async Nat {
    switch (vendors.get(vendorId)) {
      case (null) { 0 };
      case (?vendor) {
        if (vendor.vendorOwner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own balance");
        };
        vendor.balance;
      };
    };
  };

  public shared ({ caller }) func withdrawVendorBalance(amount : Nat) : async () {
    switch (vendors.get(caller)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        if (vendor.balance < amount) {
          Runtime.trap("Insufficient balance");
        };
        let updated = {
          vendor with
          balance = vendor.balance - amount;
        };
        vendors.add(caller, updated);
      };
    };
  };

  // Helper function to normalize category strings (trim + lowercase)
  func normalizeCategory(category : Text) : Text {
    let trimmed = category.trim(#char ' ');
    trimmed.map(
      func(c) {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(c.toNat32() + 32);
        } else { c };
      }
    );
  };

  public type Product = {
    id : Text;
    vendorId : Principal;
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    createdAt : Int;
  };

  var products = Map.empty<Text, Product>();

  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (product.vendorId != caller) {
      Runtime.trap("Unauthorized: Can only create products for your own vendor");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(productId : Text, product : Product) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        if (existing.vendorId != caller and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          Runtime.trap("Unauthorized: Only update your own products");
        };
        products.add(productId, product);
      };
    };
  };

  public query ({ caller }) func listProducts() : async [Product] {
    products.values().toArray();
  };

  public type OrderStatus = {
    #pending;
    #paid;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : Text;
    customerId : Principal;
    vendorId : Principal;
    productId : Text;
    quantity : Nat;
    totalAmount : Nat;
    status : OrderStatus;
    createdAt : Int;
  };

  var orders = Map.empty<Text, Order>();

  public shared ({ caller }) func createOrder(order : Order) : async () {
    if (order.customerId != caller) {
      Runtime.trap("Unauthorized: Can only create orders for yourself");
    };
    orders.add(order.id, order);
  };

  public query ({ caller }) func getOrder(orderId : Text) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (order.customerId != caller and order.vendorId != caller and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getVendorOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view vendor orders");
    };

    switch (vendors.get(caller)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        return orders.values().toArray().filter(func(order) { order.vendorId == caller });
      };
    };
  };

  public query ({ caller }) func listOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list orders");
    };

    let isAdmin = AccessControl.hasPermission(accessControlState, caller, #admin);
    if (isAdmin) {
      return orders.values().toArray();
    };

    orders.values().toArray().filter(func(order : Order) : Bool {
      order.customerId == caller or order.vendorId == caller
    });
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.vendorId != caller and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          Runtime.trap("Unauthorized: Only vendor or admin can update order status");
        };
        let updated = {
          order with
          status = status;
        };
        orders.add(orderId, updated);
      };
    };
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    switch (stripeConfig) {
      case (null) { false };
      case (_) { true };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured.") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
