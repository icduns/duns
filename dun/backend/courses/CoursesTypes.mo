import LessonsTypes "../lessons/LessonsTypes";

module {
  public type Course = {
    id: Text;
    title: Text;
    subtitle: Text;
    description: Text;
    published: Bool;
  };

  public type CreateCourseRequest = {
    title: Text;
    subtitle: Text;
    description: Text;
  };

  public type UpdateCourseRequest = {
    id: Text;
    title: Text;
    subtitle: Text;
    description: Text;
  };
};
