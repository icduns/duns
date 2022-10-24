import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

import ArrayUtils "../utils/ArrayUtils";
import Utils "../utils/Utils";

import Types "../Types";

module {

  public type CourseProgressId = {
    userId : Principal;
    courseId : Text;
  };

  public type CourseProgress = {
    id : CourseProgressId;
    lessonIds : [Text];
    completed : Bool;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    completedAt : ?Time.Time;
  };

  public type StudentStorage = {
    studentCourses : [(Text, CourseProgress)];
  };

  public class StudentService() {
    private var studentCourses = HashMap.HashMap<Text, CourseProgress>(
      10,
      Text.equal,
      Text.hash,
    );

    public func getEmptyStorage() : StudentStorage {
      return {
        studentCourses = [];
      };
    };

    public func importFromStorage(storage : StudentStorage) {
      studentCourses := HashMap.fromIter<Text, CourseProgress>(
        storage.studentCourses.vals(),
        storage.studentCourses.size(),
        Text.equal,
        Text.hash,
      );
    };

    public func exportToStorage() : StudentStorage {
      return {
        studentCourses = Iter.toArray(studentCourses.entries());
      };
    };

    public func getStudentCourses(userId : Principal) : Types.Response<[CourseProgress]> {
      let studentCoursesByUser = HashMap.mapFilter<Text, CourseProgress, CourseProgress>(
        studentCourses,
        Text.equal,
        Text.hash,
        func(key : Text, courseProgress : CourseProgress) : ?CourseProgress {
          if (Text.startsWith(key, #text(Principal.toText(userId)))) {
            return Option.make(courseProgress);
          } else {
            return null;
          };
        },
      );
      return #ok(Iter.toArray(studentCoursesByUser.vals()));
    };

    public func getCourseProgress(id : CourseProgressId) : Types.Response<CourseProgress> {
      switch (studentCourses.get(getStudentCourseKey(id))) {
        case (?courseProgress) {
          return #ok(courseProgress);
        };
        case (null) {
          return #err(courseProgressNotFoundResponse(id));
        };
      };
    };

    public func startCourse(id : CourseProgressId) : Types.Response<CourseProgress> {
      if (Option.isSome(studentCourses.get(getStudentCourseKey(id)))) {
        return #err(courseAlreadyStartedResponse(id));
      };

      let now : Time.Time = Time.now();

      let courseProgress : CourseProgress = {
        id = id;
        lessonIds = [];
        createdAt = now;
        updatedAt = now;
        completed = false;
        completedAt = null;
      };

      studentCourses.put(getStudentCourseKey(courseProgress.id), courseProgress);
      return #ok(courseProgress);
    };

    public func completeLesson(id : CourseProgressId, lessonId : Text) : Types.Response<CourseProgress> {
      switch (getCourseProgress(id)) {
        case (#ok(courseProgress)) {
          if (courseProgress.completed) {
            return #err(courseAlreadyCompletedResponse(id));
          };

          if (ArrayUtils.findInArray(courseProgress.lessonIds, lessonId, Text.equal)) {
            return #err(lessonAlreadyCompletedResponse(id, lessonId));
          };

          let updatedCourseProgress : CourseProgress = {
            // unchanged properties
            id = courseProgress.id;
            createdAt = courseProgress.createdAt;
            completedAt = courseProgress.completedAt;
            completed = courseProgress.completed;
            // updated properties
            lessonIds = ArrayUtils.appendToArray(
              courseProgress.lessonIds,
              lessonId,
            );
            updatedAt = Time.now();
          };

          studentCourses.put(
            getStudentCourseKey(updatedCourseProgress.id),
            updatedCourseProgress,
          );
          return #ok(updatedCourseProgress);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func completeCourse(id : CourseProgressId) : Types.Response<CourseProgress> {
      switch (getCourseProgress(id)) {
        case (#ok(courseProgress)) {
          if (courseProgress.completed) {
            return #err(courseAlreadyCompletedResponse(id));
          };

          let updatedCourseProgress : CourseProgress = {
            // unchanged properties
            id = courseProgress.id;
            lessonIds = courseProgress.lessonIds;
            createdAt = courseProgress.createdAt;
            updatedAt = courseProgress.updatedAt;
            // updated properties
            completedAt = ?Time.now();
            completed = true;
          };

          studentCourses.put(
            getStudentCourseKey(updatedCourseProgress.id),
            updatedCourseProgress,
          );
          return #ok(updatedCourseProgress);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    private func courseAlreadyStartedResponse(id : CourseProgressId) : Types.ErrorResponse {
      return Utils.errorResponse(
        #already_exists,
        #text(
          "User " # Principal.toText(id.userId) # " has already started course with id " # id.courseId,
        ),
      );
    };

    private func courseProgressNotFoundResponse(id : CourseProgressId) : Types.ErrorResponse {
      return Utils.errorResponse(
        #not_found,
        #text(
          "Course progress for user " # Principal.toText(id.userId) # " and course with id " # id.courseId # " doesn't exist",
        ),
      );
    };

    private func courseAlreadyCompletedResponse(id : CourseProgressId) : Types.ErrorResponse {
      return Utils.errorResponse(
        #already_exists,
        #text(
          "User " # Principal.toText(id.userId) # " has already completed course with id " # id.courseId,
        ),
      );
    };

    private func lessonAlreadyCompletedResponse(
      id : CourseProgressId,
      lessonId : Text,
    ) : Types.ErrorResponse {
      return Utils.errorResponse(
        #already_exists,
        #text(
          "User " # Principal.toText(id.userId) # " has already completed lesson with id " # lessonId,
        ),
      );
    };

    private func getStudentCourseKey(id : CourseProgressId) : Text {
      return Principal.toText(id.userId) # ":" # id.courseId;
    };

  };

};
