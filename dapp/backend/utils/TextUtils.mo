import Char "mo:base/Char";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

module {

  public func isBlank(string : Text) : Bool {
    return Text.size(Text.trim(string, #char ' ')) == 0;
  };

  public func includesSubstring(string : Text, substring : Text) : Bool {
    let stringArray = Iter.toArray<Char>(string.chars());
    let substringArray = Iter.toArray<Char>(substring.chars());

    var i = 0;
    var j = 0;

    while (i < stringArray.size() and j < substringArray.size()) {
      if (stringArray[i] == substringArray[j]) {
        i += 1;
        j += 1;
        if (j == substringArray.size()) { return true };
      } else {
        i += 1;
        j := 0;
      };
    };
    return false;
  };

  public func splitToWords(string : Text) : [Text] {
    let whitespacePattern : Text.Pattern = #predicate(func(c : Char) : Bool { Char.isWhitespace(c) });
    return Iter.toArray(Text.tokens(string, whitespacePattern));
  };

};
