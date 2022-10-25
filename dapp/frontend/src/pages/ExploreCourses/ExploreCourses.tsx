import {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { call, Course, SearchCoursesRequest } from '~/api';
import exploreCoursesBackground from '~/assets/explore_courses_background.png';
import { CourseDrawer } from '~/components/CourseDrawer';
import { Courses } from '~/components/Courses';
import { CoursesPlaceholder } from '~/components/Courses/CoursesPlaceholder';
import { ExploreCoursesSearchToolbar } from '~/pages/ExploreCourses/ExploreCoursesSearchToolbar';
import { AuthContext } from '~/providers/AuthProvider';
import styles from './ExploreCourses.module.less';

const { Title } = Typography;
const exploreCoursesBannerStyle: CSSProperties = {
  background: `url(${exploreCoursesBackground}) left top/cover`,
};
const noSearchResultsOptions = [
  'courses.no_search_results_placeholder_2',
  'courses.no_search_results_placeholder_3',
  'courses.no_search_results_placeholder_4',
];
export default function ExploreCourses() {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext);

  const [courses, setCourses] = useState<Array<Course> | undefined>();
  const [courseInfo, setCourseInfo] = useState<Course>();
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchRequest, setSearchRequest] = useState<SearchCoursesRequest>({
    searchString: '',
    categories: [],
  });
  const [loading, setLoading] = useState(false);

  const placeholder = useMemo(
    () =>
      showNoResults ? (
        <div className={styles.exploreCourses_noSearchResults}>
          <Title level={4}>
            {t('courses.no_search_results_placeholder_1')}
          </Title>
          {noSearchResultsOptions.map((option, index) => (
            <Space
              className={styles.exploreCourses_noSearchResults_placeholderItem}
              key={index}
              size={14}
            >
              <CheckOutlined />
              <Title level={5} type="secondary">
                {t(option)}
              </Title>
            </Space>
          ))}
        </div>
      ) : (
        <CoursesPlaceholder />
      ),
    [showNoResults, t],
  );
  const title = useMemo(() => {
    if (showNoResults) {
      return t('courses.no_search_results');
    }
    return t('courses.explore');
  }, [showNoResults, t]);
  const header = useMemo(
    () => (
      <>
        {!isAuthenticated && (
          <div
            className={styles.exploreCourses_banner}
            style={exploreCoursesBannerStyle}
          >
            <div className={styles.exploreCourses_banner_tile}>
              <Title
                className={styles.exploreCourses_banner_tile_title_1}
                level={4}
              >
                {t('banner.welcome_to')}
              </Title>
              <Title
                className={styles.exploreCourses_banner_tile_title_2}
                level={3}
              >
                {t('banner.decentralized_universities')}
              </Title>
              <Title
                className={styles.exploreCourses_banner_tile_title_3}
                level={1}
              >
                {t('courses.explore_courses_banner_title')}
              </Title>
            </div>
          </div>
        )}
        <ExploreCoursesSearchToolbar
          value={searchRequest}
          onChange={setSearchRequest}
        />
        <Title className={styles.exploreCourses_title} level={3}>
          {title}
        </Title>
      </>
    ),
    [isAuthenticated, searchRequest, t, title],
  );

  const handleCloseCourseInfo = useCallback(() => setCourseInfo(undefined), []);

  useEffect(() => {
    setLoading(true);
    call('searchCourses', searchRequest)
      .then(setCourses)
      .finally(() => setLoading(false));
  }, [searchRequest]);

  useEffect(
    () =>
      setShowNoResults(
        !courses?.length &&
          Boolean(
            searchRequest.searchString || searchRequest.categories.length,
          ),
      ),
    [courses?.length, searchRequest.categories, searchRequest.searchString],
  );

  return (
    <>
      <Courses
        onOpenCourseInfo={setCourseInfo}
        header={header}
        courses={courses}
        placeholder={placeholder}
        loading={loading}
      />
      <CourseDrawer
        enableStartCourse={isAuthenticated}
        open={Boolean(courseInfo)}
        course={courseInfo}
        onClose={handleCloseCourseInfo}
      />
    </>
  );
}
