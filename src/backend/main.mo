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
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";

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
  let reviews = Map.empty<Text, Review>();

  // User types/records
  public type UserProfile = {
    name : Text;
    email : ?Text;
    createdAt : Int;
    pendingRewardCampaigns : [Text];
  };

  // Vendor Review types/records
  public type Review = {
    reviewId : Text;
    vendorId : Text;
    authorPrincipal : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  public type VendorRatingSummary = {
    vendorId : ?Principal;
    averageRating : Float;
    totalReviews : Nat;
    starBreakdown : [Nat];
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get Stripe session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(userProfile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save their profile");
    };
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create a profile");
    };
    let newUserProfile : UserProfile = {
      name = userProfile.name;
      email = userProfile.email;
      createdAt = Time.now();
      pendingRewardCampaigns = [];
    };
    userProfiles.add(caller, newUserProfile);
  };

  public shared ({ caller }) func finishOnboarding() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can finish onboarding");
    };
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create projects");
    };
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
          Runtime.trap("Unauthorized: Only can view analytics for your own projects");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create a vendor profile");
    };
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create products");
    };
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
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
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

  // Admin: list all vendors
  public query ({ caller }) func listAllVendorsQuery() : async [Vendor] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admin can list all vendors");
    };
    vendors.values().toArray();
  };

  // Admin: list all unpublished vendors
  public query ({ caller }) func listAllUnpublishedVendors() : async [Vendor] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admin can list all unpublished vendors");
    };
    vendors.values().toArray().filter(
      func(v) { not v.published }
    );
  };

  // List product stock for a vendor: only the vendor owner or an admin may view stock details
  public query ({ caller }) func listProductStockByVendorId(vendorId : Principal) : async [Product] {
    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        if (vendor.vendorOwner != caller and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          Runtime.trap("Unauthorized: Only the vendor owner or an admin can view product stock");
        };
        let vendorProducts = products.values().toArray().filter(
          func(product) { product.vendorId == vendorId }
        );
        return vendorProducts;
      };
    };
  };

  public shared ({ caller }) func verifyVendor(vendorId : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can verify vendors");
    };
    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        let verified = {
          vendor with
          published = true;
        };
        vendors.add(vendorId, verified);
      };
    };
  };

  public query ({ caller }) func searchCategory(category : Text) : async [Vendor] {
    let filteredVendors = vendors.values().toArray().filter(
      func(v) { v.published and v.categories.find(func(cat) { Text.equal(cat, category) }) != null }
    );
    let sortedVendors = filteredVendors.sort(
      func(a, b) {
        if (a.createdAt < b.createdAt) {
          #less;
        } else if (a.createdAt > b.createdAt) {
          #greater;
        } else {
          #equal;
        };
      }
    );
    return sortedVendors;
  };

  // Vendor reviews and ratings

  /// Returns all reviews for a given vendorId (principalId as text for frontend compatibility).
  /// Read-only: accessible by anyone including guests.
  public query func getVendorReviews(vendorId : Text) : async [Review] {
    let values = reviews.values().filter(
      func(review) {
        Text.equal(review.vendorId, vendorId);
      }
    );
    values.toArray();
  };

  /// Returns the average rating for a given vendorId (principalId as Text).
  /// Read-only: accessible by anyone including guests.
  public query func getAverageRating(vendorId : Text) : async Float {
    let vendorReviews = reviews.values().filter(
      func(review) {
        Text.equal(review.vendorId, vendorId);
      }
    );

    let reviewsList = vendorReviews.toArray();
    if (reviewsList.size() == 0) {
      return 0.0;
    };

    let sum = reviewsList.foldLeft(
      0,
      func(acc, review) {
        acc + review.rating;
      },
    );

    Int.fromNat(sum).toFloat() / Int.fromNat(reviewsList.size()).toFloat();
  };

  /// Returns a rating summary for the given vendor, including average rating,
  /// total number of reviews, and a breakdown of review counts per star level.
  public query ({ caller }) func getVendorRatingSummary(vendorId : Principal) : async VendorRatingSummary {
    let vendorIdText = vendorId.toText();
    let vendorReviews = reviews.values().toArray().filter(
      func(review) {
        Text.equal(review.vendorId, vendorIdText);
      }
    );

    let totalReviews = vendorReviews.size();

    let starBreakdown = Array.tabulate(
      5,
      func(i) {
        let stars = i + 1;
        vendorReviews.filter(
          func(review) {
            review.rating == stars;
          }
        ).size();
      },
    );

    let totalScore = vendorReviews.foldLeft(
      0,
      func(acc, review) {
        acc + review.rating;
      },
    );

    let averageRating = if (totalReviews > 0) {
      Int.fromNat(totalScore).toFloat() / Int.fromNat(totalReviews).toFloat();
    } else { 0.0 };

    {
      vendorId = ?vendorId;
      averageRating;
      totalReviews;
      starBreakdown;
    };
  };

  /// Creates a new review for the calling principal.
  /// Only authenticated users (#user role) may submit reviews.
  public shared ({ caller }) func submitReview(vendorId : Text, rating : Nat, comment : Text) : async {
    #ok;
    #err : Text;
  } {
    // Only authenticated users can submit reviews
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can submit reviews");
    };

    // Validate rating range (1-5)
    if (rating < 1 or rating > 5) {
      return #err "Rating must be between 1 and 5";
    };

    // Check if the vendor exists
    switch (vendors.get(Principal.fromText(vendorId))) {
      case (null) { return #err "Vendor not found" };
      case (_) {};
    };

    // Prevent multiple reviews from the same user for the same vendor
    let existingReviews = reviews.values().filter(
      func(review) {
        Text.equal(review.vendorId, vendorId) and Principal.equal(review.authorPrincipal, caller);
      }
    );
    let reviewsList = existingReviews.toArray();
    if (reviewsList.size() > 0) {
      return #err "You have already submitted a review for this vendor";
    };

    let reviewId = Time.now().toText().concat(caller.toText());
    let newReview : Review = {
      reviewId;
      vendorId;
      authorPrincipal = caller;
      rating;
      comment;
      createdAt = Time.now();
    };

    reviews.add(reviewId, newReview);
    #ok;
  };
};
