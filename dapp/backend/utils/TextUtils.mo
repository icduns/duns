import Iter "mo:base/Iter";
import Text "mo:base/Text";

module {

  public func isBlank(string : Text) : Bool {
    return Text.size(Text.trim(string, #char ' ')) == 0;
  };

  public func includesText(string : Text, term : Text) : Bool {
    let stringArray = Iter.toArray<Char>(string.chars());
    let termArray = Iter.toArray<Char>(term.chars());

    var i = 0;
    var j = 0;

    while (i < stringArray.size() and j < termArray.size()) {
      if (stringArray[i] == termArray[j]) {
        i += 1;
        j += 1;
        if (j == termArray.size()) { return true };
      } else {
        i += 1;
        j := 0;
      };
    };
    return false;
  };

};
