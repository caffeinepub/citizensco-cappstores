import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old Vendor type (no normalization)
  type OldVendor = {
    principalId : Principal;
    vendorOwner : Principal;
    displayName : Text;
    bio : Text;
    balance : Nat;
    createdAt : Int;
    published : Bool;
    categories : [Text];
  };

  // Old Actor type
  type OldActor = {
    vendors : Map.Map<Principal, OldVendor>;
  };

  // Helper function for category normalization
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

  // New Vendor type with normalized categories
  type NewVendor = {
    principalId : Principal;
    vendorOwner : Principal;
    displayName : Text;
    bio : Text;
    balance : Nat;
    createdAt : Int;
    published : Bool;
    categories : [Text];
  };

  // New Actor type
  type NewActor = {
    vendors : Map.Map<Principal, NewVendor>;
  };

  public func run(old : OldActor) : NewActor {
    let newVendors = old.vendors.map<Principal, OldVendor, NewVendor>(
      func(_id, oldVendor) {
        {
          oldVendor with
          categories = oldVendor.categories.map(normalizeCategory);
        };
      }
    );
    { vendors = newVendors };
  };
};
