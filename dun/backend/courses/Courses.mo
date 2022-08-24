import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

import CoursesTypes "./CoursesTypes";
import Lessons "../lessons/Lessons";
import Types "../Types";
import Utils "../Utils";

module {
  public type Course = CoursesTypes.Course;
  public type CourseResponse = CoursesTypes.CourseResponse;
  public type CreateCourseRequest = CoursesTypes.CreateCourseRequest;
  public type UpdateCourseRequest = CoursesTypes.UpdateCourseRequest;

  public class CoursesService(savedCourses: [(Text, Course)], lessonsService: Lessons.LessonsService) {
    private var courses: HashMap.HashMap<Text, Course> =
      HashMap.fromIter<Text, Course>(savedCourses.vals(), savedCourses.size(), Text.equal, Text.hash);

    public func getCoursesForSave(): [(Text, Course)] {
      Iter.toArray(courses.entries());
    };

    public func getCourse(id: Text): Types.Response<CourseResponse> {
      let course = courses.get(id);

      switch (course) {
        case (?course) #ok(mapCourse(course));
        case (null) #err(Utils.errorResponse(#not_found, #text("Course with id " # id # " doesn't exists")));
      };
    };

    public func getCourses(): Types.Response<[CourseResponse]> {
      let response = Iter.map<Course, CourseResponse>(courses.vals(), mapCourse);

      #ok(Iter.toArray(response));
    };

    public func deleteCourse(id: Text): Types.Response<Bool> {
      let result = lessonsService.deleteCourseLessons(id);

      switch (result) {
        case (#err(result)) #err(result);
        case (#ok(result)) {
          courses.delete(id);
          #ok(true);
        };
      };
    };

    public func updateCourse(request: UpdateCourseRequest): Types.Response<Course> {
      let existCourse: ?Course = courses.get(request.id);

      switch (existCourse) {
        case (null) return #err(Utils.errorResponse(#not_found, #text("qwer")));
        case (?existCourse) {
          let updatedCourse: Course = {
            id = existCourse.id;
            published = existCourse.published;
            title = request.title;
            subtitle = request.subtitle;
            description = request.description;
          };
          courses.put(updatedCourse.id, updatedCourse);

          return #ok(updatedCourse);
        }
      }
    };

    public func createCourse(request: CreateCourseRequest): async Types.Response<CourseResponse> {
      try {
        let uuid: Text = await Utils.genUuid();
        let course: Course = {
          id = uuid;
          title = request.title;
          subtitle = request.subtitle;
          description = request.description;
          published = false;
        };

        courses.put(uuid, course);
        #ok(mapCourse(course));
      } catch(e: Error) {
        #err(Utils.errorResponse(#internal_server_error, #error(e)));
      };
    };

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
  };
};
