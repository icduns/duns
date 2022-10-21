import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import TrieSet "mo:base/TrieSet";

import Files "./services/Files";
import Courses "./services/Courses";
import Lessons "./services/Lessons";
import Users "./services/Users";

import TextUtils "./utils/TextUtils";
import Utils "./utils/Utils";

import Types "./Types";

actor Dun {

  // Roles
  private let TUTOR = "TUTOR";
  private let STUDENT = "STUDENT";

  private let userService : Users.UserService = Users.UserService(
    {
      userRoles = [TUTOR, STUDENT];
    },
  );

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

        // video types
        "video/mp4",
        "video/mpeg",
        "video/x-msvideo",
        "video/x-ms-wmv",
      ];
    },
  );

  private let lessonService : Lessons.LessonService = Lessons.LessonService();
  private let courseService : Courses.CourseService = Courses.CourseService();

  private stable var userStorage : Users.UserStorage = userService.getEmptyStorage();
  private stable var fileStorage : Files.FileStorage = fileService.getEmptyStorage();
  private stable var lessonStorage : Lessons.LessonStorage = lessonService.getEmptyStorage();
  private stable var courseStorage : Courses.CourseStorage = courseService.getEmptyStorage();

  system func preupgrade() {
    userStorage := userService.exportToStorage();
    fileStorage := fileService.exportToStorage();
    lessonStorage := lessonService.exportToStorage();
    courseStorage := courseService.exportToStorage();
  };

  system func postupgrade() {
    userService.importFromStorage(userStorage);
    userStorage := userService.getEmptyStorage();

    fileService.importFromStorage(fileStorage);
    fileStorage := fileService.getEmptyStorage();

    lessonService.importFromStorage(lessonStorage);
    lessonStorage := lessonService.getEmptyStorage();

    courseService.importFromStorage(courseStorage);
    courseStorage := courseService.getEmptyStorage();
  };

  public shared query func getCanisterId() : async Principal {
    return Principal.fromActor(Dun);
  };

  /* --- Users API --- */

  public type RegisterUserRequest = {
    firstName : Text;
    lastName : Text;
    isTutor : Bool;
  };

  public type UpdateUserProfileRequest = RegisterUserRequest and {
    email : ?Text;
    aboutMe : ?Text;
    imageId : ?Text;
  };

  public shared query ({ caller }) func getUser() : async Types.Response<Users.User> {
    return userService.getUser(caller);
  };

  public shared ({ caller }) func registerUser(request : RegisterUserRequest) : async Types.Response<Users.User> {
    let roles = Buffer.Buffer<Text>(2);
    roles.add(STUDENT);
    if (request.isTutor) {
      roles.add(TUTOR);
    };

    let createUserRequest : Users.CreateUserRequest = {
      id = caller;
      firstName = request.firstName;
      lastName = request.lastName;
      roles = roles.toArray();
    };

    return userService.createUser(createUserRequest);
  };

  public shared ({ caller }) func updateUserProfile(request : UpdateUserProfileRequest) : async Types.Response<Users.User> {
    switch (userService.getUser(caller)) {
      case (#ok(user)) {
        let roles = Buffer.Buffer<Text>(2);
        roles.add(STUDENT);
        if (request.isTutor) {
          roles.add(TUTOR);
        } else {
          if (userService.isUserInRole(caller, TUTOR)) {
            return #err(invalidIsTutorResponse());
          };
        };

        let updateUserRequest : Users.UpdateUserRequest = {
          id = caller;
          firstName = request.firstName;
          lastName = request.lastName;
          roles = roles.toArray();
          email = request.email;
          aboutMe = request.aboutMe;
          imageId = request.imageId;
        };

        switch (userService.updateUser(updateUserRequest)) {
          case (#ok(updatedUser)) {
            if (Option.isSome(user.imageId) and user.imageId != updatedUser.imageId) {
              ignore do ? {
                deleteFiles(caller, [user.imageId!]);
              };
            };
            return #ok(updatedUser);
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  /* --- Files API --- */

  public shared query func getFileServiceConfig() : async Types.Response<Files.FileServiceConfig> {
    return fileService.getConfig();
  };

  public shared query func getFile(id : Text) : async Types.Response<Files.File> {
    return fileService.getFile(id);
  };

  public shared ({ caller }) func createFile(request : Files.CreateFileRequest) : async Types.Response<Files.File> {
    if (not userService.isUserInRole(caller, TUTOR) and not userService.isUserInRole(caller, STUDENT)) {
      return #err(Utils.accessDeniedResponse());
    };
    return await fileService.createFile(caller, request);
  };

  public shared ({ caller }) func renameFile(id : Text, name : Text) : async Types.Response<Files.File> {
    if (not userService.isUserInRole(caller, TUTOR) and not userService.isUserInRole(caller, STUDENT)) {
      return #err(Utils.accessDeniedResponse());
    };
    return fileService.renameFile(caller, id, name);
  };

  public shared query func getUploadedChunkNums(fileId : Text) : async Types.Response<[Nat]> {
    return fileService.getUploadedChunkNums(fileId);
  };

  public shared query func getChunk(fileId : Text, chunkNum : Nat) : async Types.Response<Blob> {
    return fileService.getChunk(fileId, chunkNum);
  };

  public shared ({ caller }) func uploadChunk(
    fileId : Text,
    chunkNum : Nat,
    chunkData : Blob,
  ) : async Types.Response<Bool> {
    if (not userService.isUserInRole(caller, TUTOR) and not userService.isUserInRole(caller, STUDENT)) {
      return #err(Utils.accessDeniedResponse());
    };
    return fileService.uploadChunk(caller, fileId, chunkNum, chunkData);
  };

  /* --- Courses API --- */

  public type SearchCoursesRequest = {
    searchString : Text;
    categories : [Text];
  };

  public shared query func searchCourses(request : SearchCoursesRequest) : async Types.Response<[Courses.Course]> {
    switch (courseService.getCoursesByCategories(request.categories)) {
      case (#ok(courses)) {
        if (not TextUtils.isBlank(request.searchString)) {
          let words = TextUtils.splitToWords(request.searchString);
          if (courses.size() > 0 and words.size() > 0) {
            return filterCoursesByWords(courses, words);
          } else {
            return #ok([]);
          };
        };
        return #ok(courses);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared query func getAllCourseCategories() : async Types.Response<[Text]> {
    return courseService.getAllCourseCategories();
  };

  public shared query func getCourse(id : Text) : async Types.Response<Courses.Course> {
    return courseService.getCourse(id);
  };

  public shared query func getCourses() : async Types.Response<[Courses.Course]> {
    return courseService.getCourses();
  };

  public shared query func getCoursesByCategories(categories : [Text]) : async Types.Response<[Courses.Course]> {
    return courseService.getCoursesByCategories(categories);
  };

  public shared query func getCoursesByLevel(level : Courses.CourseLevel) : async Types.Response<[Courses.Course]> {
    return courseService.getCoursesByLevel(level);
  };

  public shared query func getCoursesByOwner(owner : Principal) : async Types.Response<[Courses.Course]> {
    return courseService.getCoursesByOwner(owner);
  };

  public shared query ({ caller }) func getCourseForTutor(id : Text) : async Types.Response<Courses.Course> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };
    return courseService.getCourseForUpdate(caller, id);
  };

  public shared query ({ caller }) func getCoursesForTutor() : async Types.Response<[Courses.Course]> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };
    return courseService.getCoursesForUpdate(caller);
  };

  public shared ({ caller }) func createCourse(request : Courses.CreateCourseRequest) : async Types.Response<Courses.Course> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };
    return await courseService.createCourse(caller, request);
  };

  public shared ({ caller }) func updateCourse(request : Courses.UpdateCourseRequest) : async Types.Response<Courses.Course> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (courseService.getCourseForUpdate(caller, request.id)) {
      case (#ok(course)) {
        switch (courseService.updateCourse(caller, request)) {
          case (#ok(updatedCourse)) {
            if (course.imageId != updatedCourse.imageId) {
              ignore deleteFiles(caller, [course.imageId]);
            };
            return #ok(updatedCourse);
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared ({ caller }) func publishCourse(id : Text) : async Types.Response<Courses.Course> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (lessonService.getLessonsByCourse(id)) {
      case (#ok(lessons)) {
        if (lessons.size() == 0) {
          return #err(publishIsNotPossibleResponse(id));
        };
        return courseService.publishCourse(caller, id);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared ({ caller }) func deleteCourse(id : Text) : async Types.Response<Bool> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (courseService.deleteCourse(caller, id)) {
      case (#ok(course)) {
        switch (lessonService.deleteLessonsByCourse(id)) {
          case (#ok(lessons)) {
            let fileIds : Buffer.Buffer<Text> = getFileIdsByLessons(lessons);
            fileIds.add(course.imageId);
            ignore deleteFiles(caller, fileIds.toArray());
            return #ok(true);
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  /* --- Lessons API --- */

  public shared query ({ caller }) func getLesson(id : Text) : async Types.Response<Lessons.Lesson> {
    if (userService.isUserInRole(caller, STUDENT)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (lessonService.getLesson(id)) {
      case (#ok(lesson)) {
        switch (courseService.getCourse(lesson.courseId)) {
          case (#ok(course)) {
            return #ok(lesson);
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared query func getLessonTitlesByCourse(courseId : Text) : async Types.Response<[Text]> {
    switch (courseService.getCourse(courseId)) {
      case (#ok(course)) {
        switch (lessonService.getLessonsByCourse(courseId)) {
          case (#ok(lessons)) {
            let titles = Buffer.Buffer<Text>(lessons.size());
            for (lesson in lessons.vals()) {
              titles.add(lesson.title);
            };
            return #ok(titles.toArray());
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared query ({ caller }) func getLessonsByCourse(courseId : Text) : async Types.Response<[Lessons.Lesson]> {
    if (not userService.isUserInRole(caller, STUDENT)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (courseService.getCourse(courseId)) {
      case (#ok(course)) {
        return lessonService.getLessonsByCourse(courseId);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared query ({ caller }) func getLessonForTutor(id : Text) : async Types.Response<Lessons.Lesson> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };

    return getLessonForUpdate(caller, id);
  };

  public shared query ({ caller }) func getLessonsForTutor(courseId : Text) : async Types.Response<[Lessons.Lesson]> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (courseService.getCourseForUpdate(caller, courseId)) {
      case (#ok(course)) {
        return lessonService.getLessonsByCourse(courseId);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared ({ caller }) func createLesson(request : Lessons.CreateLessonRequest) : async Types.Response<Lessons.Lesson> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (courseService.getCourseForUpdate(caller, request.courseId)) {
      case (#ok(course)) {
        return await lessonService.createLesson(request);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared ({ caller }) func updateLesson(request : Lessons.UpdateLessonRequest) : async Types.Response<Lessons.Lesson> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (getLessonForUpdate(caller, request.id)) {
      case (#ok(lesson)) {
        switch (lessonService.updateLesson(request)) {
          case (#ok(updatedLesson)) {
            let fileIds : Buffer.Buffer<Text> = getFileIdsToDelete(
              lesson,
              updatedLesson,
            );
            ignore deleteFiles(caller, fileIds.toArray());
            return #ok(updatedLesson);
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared ({ caller }) func deleteLesson(id : Text) : async Types.Response<Bool> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (getLessonForUpdate(caller, id)) {
      case (#ok(lesson)) {
        switch (lessonService.deleteLesson(id)) {
          case (#ok(lesson)) {
            let fileIds : Buffer.Buffer<Text> = getFileIdsByLessons([lesson]);
            ignore deleteFiles(caller, fileIds.toArray());
            return #ok(true);
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public shared ({ caller }) func orderLessons(
    courseId : Text,
    lessonIds : [Text],
  ) : async Types.Response<Bool> {
    if (not userService.isUserInRole(caller, TUTOR)) {
      return #err(Utils.accessDeniedResponse());
    };

    switch (courseService.getCourseForUpdate(caller, courseId)) {
      case (#ok(course)) {
        switch (courseService.updateCourse(caller, course)) {
          case (#ok(course)) {
            return lessonService.orderLessons(courseId, lessonIds);
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  /* --- Private functions --- */

  private func invalidIsTutorResponse() : Types.ErrorResponse {
    return Utils.errorResponse(
      #invalid_input,
      #text(
        "isTutor can't be turn off",
      ),
    );
  };

  private func publishIsNotPossibleResponse(courseId : Text) : Types.ErrorResponse {
    return Utils.errorResponse(
      #invalid_input,
      #text(
        "Course with id " # courseId # " can't be published",
      ),
    );
  };

  private func getFileIdsByLessons(lessons : [Lessons.Lesson]) : Buffer.Buffer<Text> {
    let fileIds = Buffer.Buffer<Text>(10);
    for (lesson in lessons.vals()) {
      for (block in lesson.blocks.vals()) {
        switch (block) {
          case (#image(block)) {
            fileIds.add(block.fileId);
          };
          case (#video(block)) {
            fileIds.add(block.fileId);
          };
          case (#text(block)) {};
        };
      };
    };
    return fileIds;
  };

  private func getFileIdsToDelete(
    oldLesson : Lessons.Lesson,
    newLesson : Lessons.Lesson,
  ) : Buffer.Buffer<Text> {
    let oldFileIds : Buffer.Buffer<Text> = getFileIdsByLessons([oldLesson]);
    let newFileIds : Buffer.Buffer<Text> = getFileIdsByLessons([newLesson]);

    let newFileIdsSet : TrieSet.Set<Text> = TrieSet.fromArray<Text>(
      newFileIds.toArray(),
      Text.hash,
      Text.equal,
    );

    let fileIdsToDelete = Buffer.Buffer<Text>(oldFileIds.size());
    for (id in oldFileIds.vals()) {
      if (not TrieSet.mem(newFileIdsSet, id, Text.hash(id), Text.equal)) {
        fileIdsToDelete.add(id);
      };
    };
    return fileIdsToDelete;
  };

  private func deleteFiles(caller : Principal, fileIds : [Text]) : async () {
    ignore fileService.deleteFiles(caller, fileIds);
    return ();
  };

  private func getLessonForUpdate(caller : Principal, id : Text) : Types.Response<Lessons.Lesson> {
    switch (lessonService.getLesson(id)) {
      case (#ok(lesson)) {
        switch (courseService.getCourseForUpdate(caller, lesson.courseId)) {
          case (#ok(course)) {
            return #ok(lesson);
          };
          case (#err(result)) {
            return #err(result);
          };
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  private func filterCoursesByWords(courses : [Courses.Course], words : [Text]) : Types.Response<[Courses.Course]> {
    var courseIdsToFilter = TrieSet.empty<Text>();

    switch (courseService.getCoursesByWords(words)) {
      case (#ok(coursesByWords)) {
        for (course in coursesByWords.vals()) {
          courseIdsToFilter := TrieSet.put<Text>(
            courseIdsToFilter,
            course.id,
            Text.hash(course.id),
            Text.equal,
          );
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };

    switch (lessonService.getLessonsByWords(words)) {
      case (#ok(lessonsByWords)) {
        for (lesson in lessonsByWords.vals()) {
          courseIdsToFilter := TrieSet.put<Text>(
            courseIdsToFilter,
            lesson.courseId,
            Text.hash(lesson.courseId),
            Text.equal,
          );
        };
      };
      case (#err(result)) {
        return #err(result);
      };
    };

    if (TrieSet.size(courseIdsToFilter) == 0) {
      return #ok([]);
    };

    let fileredCourses = Array.filter<Courses.Course>(
      courses,
      func(course : Courses.Course) : Bool {
        return TrieSet.mem(
          courseIdsToFilter,
          course.id,
          Text.hash(course.id),
          Text.equal,
        );
      },
    );
    return #ok(fileredCourses);
  };

};
