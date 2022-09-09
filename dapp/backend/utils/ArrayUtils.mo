import Array "mo:base/Array";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import TrieSet "mo:base/TrieSet";

module {

  public func findInArray<T>(array : [T], itemToFind : T, eq : (T, T) -> Bool) : Bool {
    return Option.isSome(Array.find<T>(array, func(item : T) { return eq(item, itemToFind) }));
  };

  public func appendToArray<T>(array : [T], itemToAppend : T) : [T] {
    return Array.tabulate<T>(
      array.size() + 1,
      func(i : Nat) {
        if (i < array.size()) {
          return array[i];
        } else {
          return itemToAppend;
        };
      },
    );
  };

  public func removeFromArray<T>(
    array : [T],
    itemToRemove : T,
    eq : (T, T) -> Bool,
  ) : [T] {
    return Array.filter<T>(
      array,
      func(item : T) : Bool {
        return not eq(item, itemToRemove);
      },
    );
  };

  public func hasArrayDuplicates<T>(
    array : [T],
    hash : T -> Hash.Hash,
    eq : (T, T) -> Bool,
  ) : Bool {
    var itemsSet : TrieSet.Set<T> = TrieSet.empty<T>();

    for (item in Iter.fromArray(array)) {
      if (TrieSet.mem(itemsSet, item, hash(item), eq)) {
        return false;
      };
      itemsSet := TrieSet.put<T>(itemsSet, item, hash(item), eq);
    };

    return true;
  };

  public func removeArrayDuplicates<T>(
    array : [T],
    hash : T -> Hash.Hash,
    eq : (T, T) -> Bool,
  ) : [T] {
    return TrieSet.toArray(TrieSet.fromArray<T>(array, hash, eq));
  };

};
