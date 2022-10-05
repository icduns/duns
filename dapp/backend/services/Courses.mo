import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import TrieSet "mo:base/TrieSet";

import ArrayUtils "../utils/ArrayUtils";
import HashMapUtils "../utils/HashMapUtils";
import TextUtils "../utils/TextUtils";
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
    owner : Principal;
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
    coursesByOwner : [(Principal, [Text])];
    publishedCourses : [Text];
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

    private var coursesByOwner = HashMap.HashMap<Principal, [Text]>(
      10,
      Principal.equal,
      Principal.hash,
    );

    private var publishedCourses = TrieSet.empty<Text>();

    public func getEmptyStorage() : CourseStorage {
      return {
        courses = [];
        coursesByCategory = [];
        coursesByLevel = [];
        coursesByOwner = [];
        coursesByPublished = [];
        publishedCourses = [];
      };
    };

    public func importFromStorage(storage : CourseStorage) {
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

      coursesByOwner := HashMap.fromIter<Principal, [Text]>(
        storage.coursesByOwner.vals(),
        storage.coursesByOwner.size(),
        Principal.equal,
        Principal.hash,
      );

      publishedCourses := TrieSet.fromArray<Text>(
        storage.publishedCourses,
        Text.hash,
        Text.equal,
      );
    };

    public func exportToStorage() : CourseStorage {
      return {
        courses = Iter.toArray(courses.entries());
        coursesByCategory = Iter.toArray(coursesByCategory.entries());
        coursesByLevel = Iter.toArray(coursesByLevel.entries());
        coursesByOwner = Iter.toArray(coursesByOwner.entries());
        publishedCourses = TrieSet.toArray(publishedCourses);
      };
    };

    public func getAllCourseCategories() : Types.Response<[Text]> {
      return #ok(Iter.toArray(coursesByCategory.keys()));
    };

    public func getCourse(id : Text) : Types.Response<Course> {
      switch (courses.get(id)) {
        case (?course) {
          if (course.published) {
            return #ok(course);
          } else {
            return #err(courseNotFoundResponse(id));
          };
        };
        case (null) {
          return #err(courseNotFoundResponse(id));
        };
      };
    };

    public func getCourseForUpdate(caller : Principal, id : Text) : Types.Response<Course> {
      switch (getCourse(id)) {
        case (#ok(course)) {
          if (course.owner != caller) {
            return #err(Utils.accessDeniedResponse());
          };
          return #ok(course);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func getCourses() : Types.Response<[Course]> {
      return #ok(HashMapUtils.getFromHashMap<Text, Course>(courses, TrieSet.toArray(publishedCourses)));
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
      return #ok(HashMapUtils.getFromHashMap<Text, Course>(courses, filterByPublished(ids)));
    };

    public func getCoursesByLevel(level : CourseLevel) : Types.Response<[Course]> {
      let ids : [Text] = Option.get(coursesByLevel.get(levelToText(level)), []);
      return #ok(HashMapUtils.getFromHashMap<Text, Course>(courses, filterByPublished(ids)));
    };

    public func getCoursesByOwner(owner : Principal) : Types.Response<[Course]> {
      let ids : [Text] = Option.get(coursesByOwner.get(owner), []);
      return #ok(HashMapUtils.getFromHashMap<Text, Course>(courses, filterByPublished(ids)));
    };

    public func getCoursesForUpdate(caller : Principal) : Types.Response<[Course]> {
      let ids : [Text] = Option.get(coursesByOwner.get(caller), []);
      return #ok(HashMapUtils.getFromHashMap<Text, Course>(courses, ids));
    };

    public func createCourse(caller : Principal, request : CreateCourseRequest) : async Types.Response<Course> {
      if (not validateCourseTitle(request.title)) {
        return #err(invalidCourseResponse());
      };

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
        owner = caller;
        createdAt = now;
        updatedAt = now;
        published = false;
        publishedAt = null;
      };

      courses.put(course.id, course);
      updateCoursesByCategory(course.id, [], course.categories);
      updateCoursesByLevel(course.id, null, ?course.level);
      updateCoursesByOwner(course, false);
      return #ok(course);
    };

    public func updateCourse(caller : Principal, request : UpdateCourseRequest) : Types.Response<Course> {
      switch (getCourseForUpdate(caller, request.id)) {
        case (#ok(course)) {
          if (not validateCourseTitle(request.title)) {
            return #err(invalidCourseResponse());
          };

          if (not validateCategories(request.categories)) {
            return #err(invalidCategoriesResponse());
          };

          let updatedCourse : Course = {
            // unchanged properties
            id = course.id;
            owner = course.owner;
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

    public func publishCourse(caller : Principal, id : Text) : Types.Response<Course> {
      switch (getCourseForUpdate(caller, id)) {
        case (#ok(course)) {
          if (course.published) {
            return #err(courseAlreadyPublishedResponse(id));
          };

          let updatedCourse : Course = {
            // unchanged properties
            id = course.id;
            owner = course.owner;
            createdAt = course.createdAt;
            updatedAt = course.updatedAt;
            title = course.title;
            categories = course.categories;
            description = course.description;
            level = course.level;
            imageId = course.imageId;

            // updated properties
            publishedAt = ?Time.now();
            published = true;
          };

          courses.put(updatedCourse.id, updatedCourse);
          publishedCourses := TrieSet.put<Text>(
            publishedCourses,
            course.id,
            Text.hash(course.id),
            Text.equal,
          );
          return #ok(updatedCourse);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func deleteCourse(caller : Principal, id : Text) : Types.Response<Course> {
      switch (getCourseForUpdate(caller, id)) {
        case (#ok(course)) {
          courses.delete(course.id);
          updateCoursesByCategory(course.id, course.categories, []);
          updateCoursesByLevel(course.id, ?course.level, null);
          updateCoursesByOwner(course, true);
          if (course.published) {
            publishedCourses := TrieSet.delete<Text>(
              publishedCourses,
              course.id,
              Text.hash(course.id),
              Text.equal,
            );
          };
          return #ok(course);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    private func validateCourseTitle(title : Text) : Bool {
      return not TextUtils.isBlank(title);
    };

    private func validateCategories(categories : [Text]) : Bool {
      return not ArrayUtils.hasArrayDuplicates(
        categories,
        Text.hash,
        Text.equal,
      );
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

    private func updateCoursesByOwner(course : Course, delete : Bool) {
      let oldKeys : [Principal] = if (delete) {
        [course.owner];
      } else {
        [];
      };

      let newKeys : [Principal] = if (delete) {
        [];
      } else {
        [course.owner];
      };

      HashMapUtils.updateHashMapOfArrays(
        coursesByOwner,
        course.id,
        oldKeys,
        newKeys,
        Text.equal,
        Principal.equal,
        Principal.hash,
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

    private func invalidCourseResponse() : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Passed course is invalid: title should not be blank",
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

    private func courseAlreadyPublishedResponse(id : Text) : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Course with id " # id # " is already published",
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

    private func filterByPublished(ids : [Text]) : [Text] {
      return TrieSet.toArray(
        TrieSet.intersect<Text>(
          publishedCourses,
          TrieSet.fromArray<Text>(ids, Text.hash, Text.equal),
          Text.equal,
        ),
      );
    };

  };

};
