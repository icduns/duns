import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import Text "mo:base/Text";
import Time "mo:base/Time";

import ArrayUtils "../utils/ArrayUtils";
import NatUtils "../utils/NatUtils";
import Utils "../utils/Utils";

import Types "../Types";

module {

  public type File = {
    id : Text;
    name : Text;
    mimeType : Text;
    size : Nat;
    chunkCount : Nat;
    uploaded : Bool;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    uploadedAt : ?Time.Time;
  };

  public type CreateFileRequest = {
    name : Text;
    mimeType : Text;
    size : Nat;
  };

  public type FileStorage = {
    files : [(Text, File)];
    chunks : [(Text, [var ?Blob])];
  };

  public type FileServiceConfig = {
    maxFileSize : Nat;
    chunkSize : Nat;
    allowedMimeTypes : [Text];
  };

  public class FileService(config : FileServiceConfig) {
    private var files = HashMap.HashMap<Text, File>(
      10,
      Text.equal,
      Text.hash,
    );

    private var chunks = HashMap.HashMap<Text, [var ?Blob]>(
      10,
      Text.equal,
      Text.hash,
    );

    public func getEmptyStorage() : FileStorage {
      return {
        files = [];
        chunks = [];
      };
    };

    public func importFiles(storage : FileStorage) {
      files := HashMap.fromIter<Text, File>(
        storage.files.vals(),
        storage.files.size(),
        Text.equal,
        Text.hash,
      );
      chunks := HashMap.fromIter<Text, [var ?Blob]>(
        storage.chunks.vals(),
        storage.chunks.size(),
        Text.equal,
        Text.hash,
      );
    };

    public func exportFiles() : FileStorage {
      return {
        files = Iter.toArray(files.entries());
        chunks = Iter.toArray(chunks.entries());
      };
    };

    public func getFile(id : Text) : Types.Response<File> {
      switch (files.get(id)) {
        case (?file) {
          return #ok(file);
        };
        case (null) {
          return #err(fileNotFoundResponse(id));
        };
      };
    };

    public func createFile(request : CreateFileRequest) : async Types.Response<File> {
      if (not validateFile(request)) {
        return #err(invalidFileResponse());
      };

      let uuid : Text = await Utils.generateUuid();
      let now : Time.Time = Time.now();

      let file : File = {
        id = uuid;
        name = request.name;
        mimeType = request.mimeType;
        size = request.size;
        chunkCount = NatUtils.chunkCount(request.size, config.chunkSize);
        uploaded = false;
        createdAt = now;
        updatedAt = now;
        uploadedAt = null;
      };

      files.put(file.id, file);
      chunks.put(file.id, Array.init<?Blob>(file.chunkCount, null));
      return #ok(file);
    };

    public func renameFile(id : Text, name : Text) : Types.Response<File> {
      switch (getFile(id)) {
        case (#ok(file)) {
          let updatedFile : File = {
            // unchanged properties
            id = file.id;
            mimeType = file.mimeType;
            size = file.size;
            chunkCount = file.chunkCount;
            createdAt = file.createdAt;
            uploaded = file.uploaded;
            uploadedAt = file.uploadedAt;
            // updated properties
            name = name;
            updatedAt = Time.now();
          };

          files.put(updatedFile.id, updatedFile);
          return #ok(updatedFile);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func deleteFile(id : Text) : Types.Response<File> {
      switch (getFile(id)) {
        case (#ok(file)) {
          files.delete(file.id);
          chunks.delete(file.id);
          return #ok(file);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func deleteFiles(ids : [Text]) : Types.Response<[File]> {
      let files = Buffer.Buffer<File>(ids.size());
      for (id in ids.vals()) {
        switch (deleteFile(id)) {
          case (#ok(file)) {
            files.add(file);
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      return #ok(files.toArray());
    };

    public func getUploadedChunkNums(fileId : Text) : Types.Response<[Nat]> {
      switch (getFile(fileId)) {
        case (#ok(file)) {
          switch (chunks.get(fileId)) {
            case (?fileChunks) {
              let chunkNums = Buffer.Buffer<Nat>(fileChunks.size());
              for (i in fileChunks.keys()) {
                if (Option.isSome(fileChunks[i])) {
                  chunkNums.add(i);
                };
              };
              return #ok(chunkNums.toArray());
            };
            case (null) {
              Prelude.unreachable();
            };
          };
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func getChunk(fileId : Text, chunkNum : Nat) : Types.Response<Blob> {
      switch (getFile(fileId)) {
        case (#ok(file)) {
          switch (chunks.get(fileId)) {
            case (?fileChunks) {
              if (not validateChunkNum(file, chunkNum)) {
                return #err(invalidChunkNumResponse(fileId, chunkNum));
              };

              switch (fileChunks[chunkNum]) {
                case (?chunk) {
                  return #ok(chunk);
                };
                case (null) {
                  return #err(chunkNotFoundResponse(fileId, chunkNum));
                };
              };
            };
            case (null) {
              Prelude.unreachable();
            };
          };
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func uploadChunk(fileId : Text, chunkNum : Nat, chunkData : Blob) : Types.Response<Bool> {
      switch (getFile(fileId)) {
        case (#ok(file)) {
          switch (chunks.get(fileId)) {
            case (?fileChunks) {
              if (not validateChunkNum(file, chunkNum)) {
                return #err(invalidChunkNumResponse(fileId, chunkNum));
              };

              if (not validateChunkSize(file, chunkNum, chunkData)) {
                return #err(invalidChunkSizeResponse(fileId, chunkNum));
              };

              switch (fileChunks[chunkNum]) {
                case (?chunk) {
                  return #err(chunkAlreadyExistsResponse(fileId, chunkNum));
                };
                case (null) {
                  fileChunks[chunkNum] := ?chunkData;
                  checkFileUploadComplete(fileId);
                  return #ok(true);
                };
              };
            };
            case (null) {
              Prelude.unreachable();
            };
          };
        };
        case (#err(result)) {
          return #err(result);
        };
      };

    };

    private func checkFileUploadComplete(fileId : Text) {
      switch (getUploadedChunkNums(fileId)) {
        case (#ok(chunkNums)) {
          Option.iterate(
            files.get(fileId),
            func(file : File) {
              if (chunkNums.size() == file.chunkCount) {
                let now : Time.Time = Time.now();

                let updatedFile : File = {
                  // unchanged properties
                  id = file.id;
                  name = file.name;
                  mimeType = file.mimeType;
                  size = file.size;
                  chunkCount = file.chunkCount;
                  createdAt = file.createdAt;
                  // updated properties
                  updatedAt = now;
                  uploaded = true;
                  uploadedAt = ?now;
                };

                files.put(updatedFile.id, updatedFile);
              };
            },
          );
        };
        case (#err(result)) {
          Prelude.unreachable();
        };
      };
    };

    private func validateFile(request : CreateFileRequest) : Bool {
      return request.size > 0 and request.size < config.maxFileSize and (
        config.allowedMimeTypes.size() == 0 or ArrayUtils.findInArray(
          config.allowedMimeTypes,
          request.mimeType,
          Text.equal,
        ),
      );
    };

    private func validateChunkNum(file : File, chunkNum : Nat) : Bool {
      return chunkNum < file.chunkCount;
    };

    private func validateChunkSize(
      file : File,
      chunkNum : Nat,
      chunkData : Blob,
    ) : Bool {
      if (chunkData.size() == 0) {
        return false;
      };

      if (chunkNum + 1 == file.chunkCount) {
        let remainder = file.size % config.chunkSize;
        if (remainder > 0) {
          return chunkData.size() == remainder;
        };
      };

      return chunkData.size() == config.chunkSize;
    };

    private func fileNotFoundResponse(id : Text) : Types.ErrorResponse {
      return Utils.errorResponse(
        #not_found,
        #text(
          "File with id " # id # " doesn't exist",
        ),
      );
    };

    private func invalidFileResponse() : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Passed file is invalid: empty, so big (max allowed size is " # Nat.toText(config.maxFileSize) # ") or mimeType is not supported",
        ),
      );
    };

    private func invalidChunkSizeResponse(fileId : Text, chunkNum : Nat) : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Passed chunk size must be equal " # Nat.toText(config.chunkSize),
        ),
      );
    };

    private func invalidChunkNumResponse(fileId : Text, chunkNum : Nat) : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Chunk num " # Nat.toText(chunkNum) # " doesn't exist for file with id " # fileId,
        ),
      );
    };

    private func chunkNotFoundResponse(fileId : Text, chunkNum : Nat) : Types.ErrorResponse {
      return Utils.errorResponse(
        #not_found,
        #text(
          "Chunk num " # Nat.toText(chunkNum) # " is not uploaded yet to file with id " # fileId,
        ),
      );
    };

    private func chunkAlreadyExistsResponse(fileId : Text, chunkNum : Nat) : Types.ErrorResponse {
      return Utils.errorResponse(
        #already_exist,
        #text(
          "Chunk num " # Nat.toText(chunkNum) # " is already uploaded to file with id " # fileId,
        ),
      );
    };

  };

};
