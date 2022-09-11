module {

  public func chunkCount(x : Nat, chunkSize : Nat) : Nat {
    var result : Nat = x / chunkSize;
    if (x % chunkSize > 0) {
      result += 1;
    };
    return result;
  };

};
