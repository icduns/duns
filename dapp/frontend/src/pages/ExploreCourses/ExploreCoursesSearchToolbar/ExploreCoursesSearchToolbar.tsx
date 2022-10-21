import { useCallback, useEffect, useMemo, useState } from 'react';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, InputProps, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { call, SearchCoursesRequest } from '~/api';
import { Criteria, CriteriaProps } from '~/components/Criteria';
import styles from './ExploreCoursesSearchToolbar.module.less';

export type ExploreCoursesSearchToolbarProps = {
  value: SearchCoursesRequest;
  onChange: (e: SearchCoursesRequest) => void;
};
export function ExploreCoursesSearchToolbar(
  props: ExploreCoursesSearchToolbarProps,
) {
  const { value, onChange } = props;
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CriteriaProps['options']>([]);

  useEffect(() => {
    call('getAllCourseCategories').then((res) =>
      setCategories(res.map((i) => ({ label: i, value: i }))),
    );
  }, []);

  const suffix = useMemo(
    () =>
      value.searchString ? (
        <Button
          type="text"
          size="small"
          onClick={() => onChange({ ...value, searchString: '' })}
        >
          <CloseOutlined />
        </Button>
      ) : undefined,
    [onChange, value],
  );
  const handleSearchChange = useCallback<Required<InputProps>['onChange']>(
    ({ target }) => onChange({ ...value, searchString: target.value }),
    [onChange, value],
  );
  const handleCategoriesChange = useCallback<CriteriaProps['onChange']>(
    (e) => onChange({ ...value, categories: e }),
    [onChange, value],
  );
  const handleSearchClear = useCallback(
    () => onChange({ searchString: '', categories: [] }),
    [onChange],
  );

  return (
    <Space className={styles.exploreCoursesSearchToolbar} size="middle">
      <Input
        className={styles.exploreCoursesSearchToolbar_searchInput}
        size="large"
        value={value.searchString}
        prefix={<SearchOutlined />}
        suffix={suffix}
        placeholder={t('courses.search_placeholder')}
        onChange={handleSearchChange}
      />
      <Criteria
        label={t('courses.categories')}
        value={value.categories}
        options={categories}
        onChange={handleCategoriesChange}
      />
      {(value.searchString || Boolean(value.categories.length)) && (
        <Button
          className={styles.exploreCoursesSearchToolbar_clearButton}
          size="large"
          type="text"
          onClick={handleSearchClear}
        >
          {t('courses.clear_search')}
        </Button>
      )}
    </Space>
  );
}
