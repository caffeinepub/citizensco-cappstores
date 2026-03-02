import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Time "mo:core/Time";

module {
  public type UserProfile = {
    name : Text;
    email : ?Text;
    createdAt : Int;
    pendingRewardCampaigns : [Text];
  };

  public type Review = {
    reviewId : Text;
    vendorId : Text;
    authorPrincipal : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Int;
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

  public type ProjectEntry = {
    id : Text;
    name : Text;
    description : Text;
    owner : Principal;
    views : Nat;
    clicks : Nat;
    createdAt : Int;
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

  public type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    vendors : Map.Map<Principal, Vendor>;
    reviews : Map.Map<Text, Review>;
    rewardCampaigns : Map.Map<Text, RewardCampaign>;
    projects : Map.Map<Text, ProjectEntry>;
    products : Map.Map<Text, Product>;
    orders : Map.Map<Text, Order>;
  };

  public type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    vendors : Map.Map<Principal, Vendor>;
    reviews : Map.Map<Text, Review>;
    rewardCampaigns : Map.Map<Text, RewardCampaign>;
    projects : Map.Map<Text, ProjectEntry>;
    products : Map.Map<Text, Product>;
    orders : Map.Map<Text, Order>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
