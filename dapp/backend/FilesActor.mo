import Files "./services/Files";

import Types "./Types";

actor {

  private let fileService : Files.FileService = Files.FileService(
    {
      // 50 mb
      maxFileSize = 1024 * 1024 * 50;

      // 1mb
      chunkSize = 1024 * 1024;

      allowedMimeTypes = [
        //image types
        "image/bmp",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/svg+xml",

        // vide types
        "video/mp4",
        "video/mpeg",
        "video/x-msvideo",
        "video/x-ms-wmv",
      ];
    },
  );

  private stable var fileStorage : Files.FileStorage = fileService.getEmptyStorage();

  system func preupgrade() {
    fileStorage := fileService.exportFiles();
  };

  system func postupgrade() {
    fileService.importFiles(fileStorage);
    fileStorage := fileService.getEmptyStorage();
  };

  /* --- Files API --- */

  public query func getFile(id : Text) : async Types.Response<Files.File> {
    return fileService.getFile(id);
  };

  public func createFile(request : Files.CreateFileRequest) : async Types.Response<Files.File> {
    return await fileService.createFile(request);
  };

  public func renameFile(id : Text, name : Text) : async Types.Response<Files.File> {
    return fileService.renameFile(id, name);
  };

  public func deleteFile(id : Text) : async Types.Response<Bool> {
    return fileService.deleteFile(id);
  };

  public query func getUploadedChunkNums(fileId : Text) : async Types.Response<[Nat]> {
    return fileService.getUploadedChunkNums(fileId);
  };

  public query func getChunk(fileId : Text, chunkNum : Nat) : async Types.Response<Blob> {
    return fileService.getChunk(fileId, chunkNum);
  };

  public func uploadChunk(fileId : Text, chunkNum : Nat, chunkData : Blob) : async Types.Response<Bool> {
    return fileService.uploadChunk(fileId, chunkNum, chunkData);
  };

};
