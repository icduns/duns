import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Time "mo:base/Time";

import ArrayUtils "../utils/ArrayUtils";
import HashMapUtils "../utils/HashMapUtils";
import Utils "../utils/Utils";

import Types "../Types";

module {

  public type Course = {
    id : Text;
    title : Text;
    categories : [Text];
    description : Text;
    level : CourseLevel;
    imageId : Text;
    published : Bool;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    publishedAt : ?Time.Time;
  };

  public type CourseLevel = {
    #beginner;
    #intermediate;
    #advanced;
    #all;
  };

  public type CreateCourseRequest = {
    title : Text;
    categories : [Text];
    description : Text;
    level : CourseLevel;
    imageId : Text;
  };

  public type UpdateCourseRequest = {
    id : Text;
    title : Text;
    categories : [Text];
    description : Text;
    level : CourseLevel;
    imageId : Text;
  };

  public type CourseStorage = {
    courses : [(Text, Course)];
    coursesByCategory : [(Text, [Text])];
    coursesByLevel : [(Text, [Text])];
  };

  public class CourseService() {
    private var courses = HashMap.HashMap<Text, Course>(
      10,
      Text.equal,
      Text.hash,
    );

    private var coursesByCategory = HashMap.HashMap<Text, [Text]>(
      10,
      Text.equal,
      Text.hash,
    );

    private var coursesByLevel = HashMap.HashMap<Text, [Text]>(
      10,
      Text.equal,
      Text.hash,
    );

    public func getEmptyStorage() : CourseStorage {
      return {
        courses = [];
        coursesByCategory = [];
        coursesByLevel = [];
      };
    };

    public func importCources(storage : CourseStorage) {
      courses := HashMap.fromIter<Text, Course>(
        storage.courses.vals(),
        storage.courses.size(),
        Text.equal,
        Text.hash,
      );
      coursesByCategory := HashMap.fromIter<Text, [Text]>(
        storage.coursesByCategory.vals(),
        storage.coursesByCategory.size(),
        Text.equal,
        Text.hash,
      );
      coursesByLevel := HashMap.fromIter<Text, [Text]>(
        storage.coursesByLevel.vals(),
        storage.coursesByLevel.size(),
        Text.equal,
        Text.hash,
      );
    };

    public func exportCourses() : CourseStorage {
      return {
        courses = Iter.toArray(courses.entries());
        coursesByCategory = Iter.toArray(coursesByCategory.entries());
        coursesByLevel = Iter.toArray(coursesByLevel.entries());
      };
    };

    public func getAllCourseCategories() : Types.Response<[Text]> {
      return #ok(Iter.toArray(coursesByCategory.keys()));
    };

    public func getCourse(id : Text) : Types.Response<Course> {
      switch (courses.get(id)) {
        case (?course) {
          return #ok(course);
        };
        case (null) {
          return #err(courseNotFoundResponse(id));
        };
      };
    };

    public func getCourses() : Types.Response<[Course]> {
      return #ok(Iter.toArray(courses.vals()));
    };

    public func getCoursesByCategories(categories : [Text]) : Types.Response<[Course]> {
      let courseIds = Buffer.Buffer<Text>(10);

      for (category in categories.vals()) {
        Option.iterate(
          coursesByCategory.get(category),
          func(ids : [Text]) {
            for (id in ids.vals()) {
              courseIds.add(id);
            };
          },
        );
      };

      let ids : [Text] = ArrayUtils.removeArrayDuplicates(
        courseIds.toArray(),
        Text.hash,
        Text.equal,
      );
      return #ok(HashMapUtils.getFromHashMap<Text, Course>(courses, ids));
    };

    public func getCoursesByLevel(level : CourseLevel) : Types.Response<[Course]> {
      let ids : [Text] = Option.get(coursesByLevel.get(levelToText(level)), []);
      return #ok(HashMapUtils.getFromHashMap<Text, Course>(courses, ids));
    };

    public func createCourse(request : CreateCourseRequest) : async Types.Response<Course> {
      if (not validateCategories(request.categories)) {
        return #err(invalidCategoriesResponse());
      };

      let uuid : Text = await Utils.generateUuid();
      let now : Time.Time = Time.now();

      let course : Course = {
        id = uuid;
        title = request.title;
        categories = request.categories;
        description = request.description;
        level = request.level;
        imageId = request.imageId;
        createdAt = now;
        updatedAt = now;
        published = false;
        publishedAt = null;
      };

      courses.put(course.id, course);
      updateCoursesByCategory(course.id, [], course.categories);
      updateCoursesByLevel(course.id, null, ?course.level);
      return #ok(course);
    };

    public func updateCourse(request : UpdateCourseRequest) : Types.Response<Course> {
      if (not validateCategories(request.categories)) {
        return #err(invalidCategoriesResponse());
      };

      switch (getCourse(request.id)) {
        case (#ok(course)) {
          let updatedCourse : Course = {
            // unchanged properties
            id = course.id;
            createdAt = course.createdAt;
            publishedAt = course.publishedAt;
            published = course.published;
            // updated properties
            title = request.title;
            categories = request.categories;
            description = request.description;
            level = request.level;
            imageId = request.imageId;
            updatedAt = Time.now();
          };

          courses.put(updatedCourse.id, updatedCourse);
          updateCoursesByCategory(
            updatedCourse.id,
            course.categories,
            updatedCourse.categories,
          );
          updateCoursesByLevel(
            updatedCourse.id,
            ?course.level,
            ?updatedCourse.level,
          );
          return #ok(updatedCourse);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func deleteCourse(id : Text) : Types.Response<Course> {
      switch (getCourse(id)) {
        case (#ok(course)) {
          courses.delete(course.id);
          updateCoursesByCategory(course.id, course.categories, []);
          updateCoursesByLevel(course.id, ?course.level, null);
          return #ok(course);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    private func validateCategories(categories : [Text]) : Bool {
      return not ArrayUtils.hasArrayDuplicates(categories, Text.hash, Text.equal);
    };

    private func updateCoursesByCategory(
      courseId : Text,
      oldCategories : [Text],
      newCategories : [Text],
    ) {
      HashMapUtils.updateHashMapOfArrays(
        coursesByCategory,
        courseId,
        oldCategories,
        newCategories,
        Text.equal,
        Text.equal,
        Text.hash,
      );
    };

    private func updateCoursesByLevel(
      courseId : Text,
      oldLevel : ?CourseLevel,
      newLevel : ?CourseLevel,
    ) {
      let oldKeys : [Text] = switch (oldLevel) {
        case (?oldLevel) {
          [levelToText(oldLevel)];
        };
        case (null) {
          [];
        };
      };

      let newKeys : [Text] = switch (newLevel) {
        case (?newLevel) {
          [levelToText(newLevel)];
        };
        case (null) {
          [];
        };
      };

      HashMapUtils.updateHashMapOfArrays(
        coursesByLevel,
        courseId,
        oldKeys,
        newKeys,
        Text.equal,
        Text.equal,
        Text.hash,
      );
    };

    private func courseNotFoundResponse(id : Text) : Types.ErrorResponse {
      return Utils.errorResponse(
        #not_found,
        #text(
          "Course with id " # id # " doesn't exist",
        ),
      );
    };

    private func invalidCategoriesResponse() : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Passed categories are invalid",
        ),
      );
    };

    private func levelToText(level : CourseLevel) : Text {
      return switch (level) {
        case (#beginner) {
          "beginner";
        };
        case (#intermediate) {
          "intermediate";
        };
        case (#advanced) {
          "advanced";
        };
        case (#all) {
          "all";
        };
      };
    };

  };

};
