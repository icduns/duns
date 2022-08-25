import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

import CoursesTypes "./CoursesTypes";
import Lessons "../lessons/Lessons";
import Types "../Types";
import Utils "../Utils";

module {
  public type Course = CoursesTypes.Course;
  public type CreateCourseRequest = CoursesTypes.CreateCourseRequest;
  public type UpdateCourseRequest = CoursesTypes.UpdateCourseRequest;

  public class CoursesService() {
    private var courses = HashMap.HashMap<Text, Course>(1, Text.equal, Text.hash);

    public func importCources(storage: [(Text, Course)]) {
      courses := HashMap.fromIter<Text, Course>(storage.vals(), storage.size(), Text.equal, Text.hash);
    };

    public func exportCourses(): [(Text, Course)] {
      return Iter.toArray(courses.entries());
    };

    public func getCourse(id: Text): Types.Response<Course> {
      switch (courses.get(id)) {
        case (?course) return #ok(course);
        case (null) return #err(Utils.errorResponse(#not_found, #text("Course with id " # id # " doesn't exists")));
      };
    };

    public func getCourses(): Types.Response<[Course]> {
      return #ok(Iter.toArray(courses.vals()));
    };

    public func createCourse(request: CreateCourseRequest): async Types.Response<Course> {
      try {
        let uuid: Text = await Utils.genUuid();
        let course: Course = {
          id = uuid;
          title = request.title;
          subtitle = request.subtitle;
          description = request.description;
          published = false;
        };
        courses.put(course.id, course);
        return #ok(course);
      } catch(e: Error) {
        return #err(Utils.errorResponse(#internal_server_error, #error(e)));
      };
    };

    public func updateCourse(request: UpdateCourseRequest): Types.Response<Course> {
      switch (getCourse(request.id)) {
        case (#ok(course)) {
          let updatedCourse: Course = {
            id = course.id;
            published = course.published;
            title = request.title;
            subtitle = request.subtitle;
            description = request.description;
          };
          courses.put(updatedCourse.id, updatedCourse);
          return #ok(updatedCourse);
        };
        case (#err(result)) return #err(result);
      };
    };

    public func deleteCourse(id: Text): Types.Response<Bool> {
      switch (getCourse(id)) {
        case (#ok(course)) {
          courses.delete(course.id);
          return #ok(true);
        };
        case (#err(result)) return #err(result);
      };
    };

    /*
    private func mapCourse(course: Course): CourseResponse {
      let courseLessons = lessonsService.getLessonsByCourse(course.id);

      switch (courseLessons) {
        case (#ok(courseLessons)) {
          return {
            id = course.id;
            title = course.title;
            subtitle = course.subtitle;
            description = course.description;
            published = course.published;
            lessons = courseLessons;
          };
        };
        case (#err(courseLessons)) {
          return {
            id = course.id;
            title = course.title;
            subtitle = course.subtitle;
            description = course.description;
            published = course.published;
            lessons = [];
          };
        };
      };
    };
    */
  };
};
