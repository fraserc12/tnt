import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  DatePicker,
  Select,
  Typography,
  Table,
  Icon,
  Checkbox
} from 'antd';
import SummaryTable from './SummaryTable';
import { StyledCard, GridContainer } from './styled';
import { fetchProjects, setActiveProject } from 'actions/projects';
import { getTimeEntryEndpointWithParams } from 'constants/endpoints';
import { getActiveProject, getActiveProjects } from 'selectors/projects';
import { getRedmineAddress, getRedmineKey } from 'selectors/redmine';
import { store } from '../../store';
import { redmineDate } from 'util/redmine';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const mapDispatchToProps = dispatch => ({
  getProjects: () => dispatch(fetchProjects()),
  setActiveProject: id => dispatch(setActiveProject(id))
});

const mapStateToProps = state => ({
  activeProject: getActiveProject(state),
  activeProjects: getActiveProjects(state)
});

const getTimeEntries = async (id, dateFrom, dateTo) => {
  const state = store.getState();
  const host = getRedmineAddress(state);
  const key = getRedmineKey(state);

  let url = new URL(
    getTimeEntryEndpointWithParams(host, {
      from: dateFrom,
      to: dateTo,
      project_id: id
    })
  );

  try {
    const entries = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Redmine-Api-Key': key
      }
    });

    const entriesJson = await entries.json();
    return entriesJson.time_entries.reverse();
  } catch (err) {
    console.log('Error.. ' + err);
  }
};

const columns = [
  {
    title: 'Date',
    dataIndex: 'spent_on',
    key: 'spent_on',
    width: 100
  },
  {
    title: 'Hours',
    dataIndex: 'hours',
    key: 'hours',
    width: 100
  },
  {
    title: 'Comment',
    dataIndex: 'comments',
    key: 'comments',
    width: 100
  }
];

const HoursLogged = ({
  getProjects,
  activeProjects,
  setActiveProject,
  activeProject
}) => {
  const [dateFrom, setFromDate] = useState();
  const [dateTo, setToDate] = useState();
  const [timeEntries, setTimeEntries] = useState([]);
  const [showHourSummary, setHourSummary] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  useEffect(() => {
    async function fetchTimeEntries() {
      let entries = await getTimeEntries(
        activeProject,
        dateFrom,
        dateTo,
        setTimeEntries
      );
      setTimeEntries(entries);
      setLoading(false);
    }

    if (dateFrom && dateTo) {
      setLoading(true);
      fetchTimeEntries();
    }
  }, [activeProject, dateFrom, dateTo]);

  const onChangeProject = id => {
    setActiveProject(id);
    if (dateFrom && dateTo) {
      setLoading(true);
      getTimeEntries(id, dateFrom, dateTo);
    }
  };

  const splitRangeSet = dates => {
    setFromDate(redmineDate(dates[0]));
    setToDate(redmineDate(dates[1]));
  };

  return (
    <>
      {showHourSummary && (
        <Alert
          style={{ marginBottom: 15 }}
          type="info"
          message="This feature will get total hours logged per entry found, grouping by date"
        />
      )}
      <StyledCard size="small" title="Time Entries">
        <GridContainer>
          <Text>Project</Text>
          <Select
            placeholder="Project"
            style={{ width: '50%', marginLeft: 15 }}
            value={activeProject}
            onChange={onChangeProject}
          >
            {activeProjects.map(({ id, name }) => (
              <Option key={id} value={id}>
                {name}
              </Option>
            ))}
          </Select>
          <Text>Date Range</Text>
          <RangePicker
            style={{ width: '50%', margin: 15 }}
            onChange={splitRangeSet}
            size="small"
          />
          <Checkbox
            checked={showHourSummary}
            onChange={e => setHourSummary(e.target.checked)}
          >
            View Total Hours per day?
          </Checkbox>
          {loading && <Icon style={{ color: 'black' }} type="loading" />}

          {timeEntries.length > 0 && !loading && !showHourSummary && (
            <Table
              rowKey={r => r.id}
              dataSource={timeEntries}
              columns={columns}
              pagination={{ pageSize: 5 }}
              style={{ width: '80%', marginBottom: 15 }}
            />
          )}

          {timeEntries.length > 0 && !loading && showHourSummary && (
            <SummaryTable groupedEntries={timeEntries} />
          )}
        </GridContainer>
      </StyledCard>
    </>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HoursLogged);
