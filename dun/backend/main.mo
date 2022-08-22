import UUID "mo:uuid/UUID";
import AsyncSource "mo:uuid/async/SourceV4";

actor {
  private let ae = AsyncSource.Source();

  public func testUUID(): async Text {
    let id = await ae.new();

    return UUID.toText(id);
  };
};
