module {
  public type Lesson = {
    id: Text;
    courseId: Text;
    title: Text;
    blocks: [LessonBlock];
  };

  public type LessonBlock = {
    #text: TextBlock;
    #image: ImageBlock;
    #video: VideoBlock;
  };

  public type Block = {
    viewSettings: Text;
  };

  public type TextBlock = Block and {
    content: Text;
  };

  public type ImageBlock = Block and {
    image: Blob;
  };

  public type VideoBlock = Block and {
    video: Blob;
  };

  public type CreateLessonRequest = {
    title: Text;
    courseId: Text;
  }
};
