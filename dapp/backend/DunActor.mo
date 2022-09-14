import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import TrieSet "mo:base/TrieSet";

import FilesActor "canister:files_backend";

import Courses "./services/Courses";
import Lessons "./services/Lessons";

import Utils "./utils/Utils";

import Types "./Types";

actor {

  private let lessonService : Lessons.LessonService = Lessons.LessonService();
  private let courseService : Courses.CourseService = Courses.CourseService();

  private stable var lessonStorage : Lessons.LessonStorage = lessonService.getEmptyStorage();
  private stable var courseStorage : Courses.CourseStorage = courseService.getEmptyStorage();

  system func preupgrade() {
    lessonStorage := lessonService.exportLessons();
    courseStorage := courseService.exportCourses();
  };

  system func postupgrade() {
    lessonService.importLessons(lessonStorage);
    lessonStorage := lessonService.getEmptyStorage();

    courseService.importCources(courseStorage);
    courseStorage := courseService.getEmptyStorage();
  };

  /* --- Courses API --- */

  public query func getAllCourseCategories() : async Types.Response<[Text]> {
    return courseService.getAllCourseCategories();
  };

  public query func getCourse(id : Text) : async Types.Response<Courses.Course> {
    return courseService.getCourse(id);
  };

  public query func getCourses() : async Types.Response<[Courses.Course]> {
    return courseService.getCourses();
  };

  public query func getCoursesByCategories(categories : [Text]) : async Types.Response<[Courses.Course]> {
    return courseService.getCoursesByCategories(categories);
  };

  public query func getCoursesByLevel(level : Courses.CourseLevel) : async Types.Response<[Courses.Course]> {
    return courseService.getCoursesByLevel(level);
  };

  public func createCourse(request : Courses.CreateCourseRequest) : async Types.Response<Courses.Course> {
    return await courseService.createCourse(request);
  };

  public func updateCourse(request : Courses.UpdateCourseRequest) : async Types.Response<Courses.Course> {
    switch (courseService.getCourse(request.id)) {
      case (#ok(course)) {
        switch (courseService.updateCourse(request)) {
          case (#ok(updatedCourse)) {
            if (course.imageId != updatedCourse.imageId) {
              ignore deleteFiles([course.imageId]);
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

  public func deleteCourse(id : Text) : async Types.Response<Bool> {
    switch (courseService.deleteCourse(id)) {
      case (#ok(course)) {
        switch (lessonService.deleteLessonsByCourse(id)) {
          case (#ok(lessons)) {
            let fileIds : Buffer.Buffer<Text> = getFileIdsByLessons(lessons);
            fileIds.add(course.imageId);
            ignore deleteFiles(fileIds.toArray());
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

  public query func getLesson(id : Text) : async Types.Response<Lessons.Lesson> {
    return lessonService.getLesson(id);
  };

  public query func getLessons() : async Types.Response<[Lessons.Lesson]> {
    return lessonService.getLessons();
  };

  public query func getLessonsByCourse(courseId : Text) : async Types.Response<[Lessons.Lesson]> {
    switch (courseService.getCourse(courseId)) {
      case (#ok(course)) {
        return lessonService.getLessonsByCourse(courseId);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public func createLesson(request : Lessons.CreateLessonRequest) : async Types.Response<Lessons.Lesson> {
    switch (courseService.getCourse(request.courseId)) {
      case (#ok(course)) {
        return await lessonService.createLesson(request);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public func updateLesson(request : Lessons.UpdateLessonRequest) : async Types.Response<Lessons.Lesson> {
    switch (lessonService.getLesson(request.id)) {
      case (#ok(lesson)) {
        switch (lessonService.updateLesson(request)) {
          case (#ok(updatedLesson)) {
            let fileIds : Buffer.Buffer<Text> = getFileIdsToDelete(
              lesson,
              updatedLesson,
            );
            ignore deleteFiles(fileIds.toArray());
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

  public func deleteLesson(id : Text) : async Types.Response<Bool> {
    switch (lessonService.deleteLesson(id)) {
      case (#ok(lesson)) {
        let fileIds : Buffer.Buffer<Text> = getFileIdsByLessons([lesson]);
        ignore deleteFiles(fileIds.toArray());
        return #ok(true);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public func orderLessons(courseId : Text, lessonIds : [Text]) : async Types.Response<Bool> {
    switch (courseService.getCourse(courseId)) {
      case (#ok(course)) {
        switch (courseService.updateCourse(course)) {
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

  private func deleteFiles(fileIds : [Text]) : async Types.Response<Bool> {
    return await FilesActor.deleteFiles(fileIds);
  };

};
