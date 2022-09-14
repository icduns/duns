import Buffer "mo:base/Buffer";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Option "mo:base/Option";
import TrieSet "mo:base/TrieSet";

import ArrayUtils "./ArrayUtils";

module {

  public func getFromHashMap<K, V>(map : HashMap.HashMap<K, V>, keys : [K]) : [V] {
    let values = Buffer.Buffer<V>(keys.size());
    for (key in keys.vals()) {
      Option.iterate(
        map.get(key),
        func(value : V) {
          values.add(value);
        },
      );
    };
    return values.toArray();
  };

  public func updateHashMap<K, V>(
    map : HashMap.HashMap<K, V>,
    value : V,
    oldKeys : [K],
    newKeys : [K],
  ) {
    for (key in oldKeys.vals()) {
      map.delete(key);
    };

    for (key in newKeys.vals()) {
      map.put(key, value);
    };
  };

  public func updateHashMapOfArrays<K, V>(
    map : HashMap.HashMap<K, [V]>,
    value : V,
    oldKeys : [K],
    newKeys : [K],
    valueEq : (V, V) -> Bool,
    keyEq : (K, K) -> Bool,
    keyHash : K -> Hash.Hash,
  ) {

    let oldSet : TrieSet.Set<K> = TrieSet.fromArray<K>(oldKeys, keyHash, keyEq);
    let newSet : TrieSet.Set<K> = TrieSet.fromArray<K>(newKeys, keyHash, keyEq);
    let commonSet : TrieSet.Set<K> = TrieSet.intersect<K>(oldSet, newSet, keyEq);

    let removeFrom = Buffer.Buffer<K>(oldKeys.size());
    let addTo = Buffer.Buffer<K>(newKeys.size());

    for (key in oldKeys.vals()) {
      if (not TrieSet.mem(commonSet, key, keyHash(key), keyEq)) {
        removeFrom.add(key);
      };
    };

    for (key in newKeys.vals()) {
      if (not TrieSet.mem(commonSet, key, keyHash(key), keyEq)) {
        addTo.add(key);
      };
    };

    for (key in removeFrom.vals()) {
      Option.iterate(
        map.get(key),
        func(values : [V]) {
          let newValues : [V] = ArrayUtils.removeFromArray<V>(
            values,
            value,
            valueEq,
          );
          if (newValues.size() == 0) {
            map.delete(key);
          } else {
            map.put(key, newValues);
          };
        },
      );
    };

    for (key in addTo.vals()) {
      let values : [V] = switch (map.get(key)) {
        case (?values) {
          ArrayUtils.appendToArray<V>(values, value);
        };
        case (null) {
          [value];
        };
      };
      map.put(key, values);
    };
  };

};
