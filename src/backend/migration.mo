import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Int "mo:core/Int";

module {
  // Old type definitions (without the imageUrl field)
  type OldProduct = {
    id : Text;
    vendorId : Principal;
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    createdAt : Int;
  };

  type OldActor = {
    products : Map.Map<Text, OldProduct>;
  };

  // New type definitions (with imageUrl field)
  type NewProduct = {
    id : Text;
    vendorId : Principal;
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    createdAt : Int;
    imageUrl : ?Text;
  };

  // Migration function to add the imageUrl field with a default value
  public func run(old : OldActor) : { products : Map.Map<Text, NewProduct> } {
    let newProducts = old.products.map<Text, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        { oldProduct with imageUrl = null };
      }
    );
    { products = newProducts };
  };
};
