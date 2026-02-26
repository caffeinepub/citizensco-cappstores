import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";

import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Stripe "stripe/stripe";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  include MixinStorage();

  // Access Control state (required for authorization in the backend)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data stores
  let vendors = Map.empty<Principal, Vendor>();
  let projects = Map.empty<Text, ProjectEntry>();
  let rewardCampaigns = Map.empty<Text, RewardCampaign>();
  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Text, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User types/records
  public type UserProfile = {
    name : Text;
    email : ?Text;
    createdAt : Int;
    pendingRewardCampaigns : [Text];
  };

  // Reward campaign types/records
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

  // Project record
  public type ProjectEntry = {
    id : Text;
    name : Text;
    description : Text;
    owner : Principal;
    views : Nat;
    clicks : Nat;
    createdAt : Int;
  };

  // Vendor types/records
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

  // Product types/records
  public type Product = {
    id : Text;
    vendorId : Principal;
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    createdAt : Int;
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

  // Stripe configuration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Stripe integration
  public query func isStripeConfigured() : async Bool {
    switch (stripeConfig) {
      case (null) { false };
      case (_) { true };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    let isAdmin = AccessControl.hasPermission(accessControlState, caller, #admin);
    if (not isAdmin) { Runtime.trap("Unauthorized: Only admins can set Stripe configuration") };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured.") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    if (not isUser) { Runtime.trap("Unauthorized: Only authenticated users can get Stripe session status") };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    if (not isUser) { Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions") };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func getUserRole(user : Principal) : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, user);
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    if (not isUser) { Runtime.trap("Unauthorized: Only authenticated users can view their profile") };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(userProfile : UserProfile) : async () {
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    if (not isUser) { Runtime.trap("Unauthorized: Only authenticated users can save their profile") };
    let existing = userProfiles.get(caller);
    let createdAt = switch (existing) {
      case (?p) { p.createdAt };
      case (null) { Time.now() };
    };
    let newUserProfile : UserProfile = {
      name = userProfile.name;
      email = userProfile.email;
      createdAt = createdAt;
      pendingRewardCampaigns = switch (existing) {
        case (?p) { p.pendingRewardCampaigns };
        case (null) { [] };
      };
    };
    userProfiles.add(caller, newUserProfile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func createUserProfile(userProfile : UserProfile) : async () {
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    if (not isUser) { Runtime.trap("Unauthorized: Only authenticated users can create a profile") };
    let newUserProfile : UserProfile = {
      name = userProfile.name;
      email = userProfile.email;
      createdAt = Time.now();
      pendingRewardCampaigns = [];
    };
    userProfiles.add(caller, newUserProfile);
  };

  public shared ({ caller }) func finishOnboarding() : async () {
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    if (not isUser) { Runtime.trap("Unauthorized: Only authenticated users can finish onboarding") };
    userProfiles.remove(caller);
  };

  // Reward campaigns
  public query ({ caller }) func listRewardCampaigns() : async [RewardCampaign] {
    rewardCampaigns.values().toArray();
  };

  public query ({ caller }) func getRewardCampaign(campaignId : Text) : async ?RewardCampaign {
    rewardCampaigns.get(campaignId);
  };

  // Projects
  public shared ({ caller }) func createProject(project : ProjectEntry) : async () {
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    if (not isUser) { Runtime.trap("Unauthorized: Only authenticated users can create projects") };
    projects.add(project.id, project);
  };

  public query ({ caller }) func getProject(projectId : Text) : async ?ProjectEntry {
    projects.get(projectId);
  };

  public query ({ caller }) func getProjectsByOwner(owner : Principal) : async [ProjectEntry] {
    let ownedProjects = projects.toArray().filter(
      func((_, project)) {
        project.owner == owner;
      }
    );
    ownedProjects.map(func((_, project)) { project });
  };

  public query ({ caller }) func getProjectAnalytics(projectId : Text) : async ?{
    views : Nat;
    clicks : Nat;
  } {
    switch (projects.get(projectId)) {
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

  // Vendors
  public shared ({ caller }) func createVendor(displayName : Text, bio : Text, categories : [Text]) : async () {
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    if (not isUser) { Runtime.trap("Unauthorized: Only authenticated users can create a vendor profile") };
    if (vendors.get(caller) != null) {
      Runtime.trap("Only one vendor per project supported for now");
    };
    let vendor : Vendor = {
      principalId = caller;
      vendorOwner = caller;
      displayName;
      bio;
      balance = 0;
      createdAt = Time.now();
      published = false;
      categories = categories;
    };
    vendors.add(caller, vendor);
  };

  public shared ({ caller }) func publishVendor() : async () {
    switch (vendors.get(caller)) {
      case (null) { Runtime.trap("Vendor does not exist") };
      case (?vendor) {
        if (vendor.principalId != caller) {
          Runtime.trap("Unauthorized: Only vendor owner can publish vendor");
        };
        let publishedVendor = {
          vendor with
          published = true;
        };
        vendors.add(caller, publishedVendor);
      };
    };
  };

  public shared ({ caller }) func unpublishVendor() : async () {
    switch (vendors.get(caller)) {
      case (null) { Runtime.trap("Vendor does not exist") };
      case (?vendor) {
        if (vendor.principalId != caller) {
          Runtime.trap("Unauthorized: Only vendor owner can unpublish vendor");
        };
        let unpublishedVendor = {
          vendor with
          published = false;
        };
        vendors.add(caller, unpublishedVendor);
      };
    };
  };

  public query func listPublicVendors() : async [Vendor] {
    vendors.values().toArray().filter(
      func(v) { v.published }
    );
  };

  public query func listPublicVendorsByCategory(category : Text) : async [Vendor] {
    vendors.values().toArray().filter(
      func(v) {
        v.published and v.categories.find(
          func(cat) {
            Text.equal(cat, category);
          }
        ) != null
      }
    );
  };

  public shared ({ caller }) func updateVendorProfile(displayName : Text, bio : Text, categories : [Text]) : async () {
    switch (vendors.get(caller)) {
      case (null) { Runtime.trap("Vendor does not exist") };
      case (?vendor) {
        if (vendor.principalId != caller) {
          Runtime.trap("Unauthorized: Only vendor owner can update profile");
        };
        let updatedVendor = {
          vendor with
          displayName;
          bio;
          categories = categories;
        };
        vendors.add(caller, updatedVendor);
      };
    };
  };

  public query ({ caller }) func getVendor(vendorId : Principal) : async ?Vendor {
    switch (vendors.get(vendorId)) {
      case (null) { null };
      case (?vendor) {
        if (vendor.principalId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only vendor or admin can view details");
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

  // Products
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

  // Order management
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
    switch (vendors.get(caller)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        return orders.values().toArray().filter(func(order) { order.vendorId == caller });
      };
    };
  };

  public query ({ caller }) func listOrders() : async [Order] {
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
        let updated = { order with status = status };
        orders.add(orderId, updated);
      };
    };
  };
};
