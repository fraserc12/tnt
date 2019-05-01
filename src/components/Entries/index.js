import React from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom'
import { Typography, Divider, Icon, Button } from "antd";
import TimeEntry from "../TimeEntry";
import { createTimeEntry } from "../../actions/entries";
import { getActiveProject } from "../../selectors/projects";
import { getRedmineAddress, getRedmineKey} from "../../selectors/redmine"
import { ActionHolder } from "./styled";

const { Title, Text } = Typography;

const mapStateToProps = state => ({
  activeProjectId: getActiveProject(state),
  redmineAddress: getRedmineAddress(state),
  redmineKey: getRedmineKey(state)
});

const mapDispatchToProps = dispatch => ({
  createNewTimeEntry: activeProjectId =>
    dispatch(createTimeEntry(activeProjectId))
});

const Entries = ({ createNewTimeEntry, activeProjectId, redmineAddress, redmineKey }) => {
  let entryMarkUp;
  if (!redmineAddress || !redmineKey) {
    entryMarkUp = (
      <Text>
        To add entries you need to insert a Redmine Address and Key <Link to="/settings">here</Link>
      </Text>
    )
  } else {
    entryMarkUp = (
      <>
        <Text>
          Draft your time entries here, don't worry about making mistakes they won't
          save until you say so!
        </Text>
        <Divider />
        <TimeEntry />
        <ActionHolder>
          <Button
            type="primary"
            onClick={() => createNewTimeEntry(activeProjectId)}
          >
            <Icon type="plus-circle" theme="filled" />
            New Time Entry
          </Button>
        </ActionHolder>
      </>
    )
  }
  
  return (
    <>
      <Title level={2}>
        <Icon type="clock-circle" /> Time Entries
      </Title>
      { entryMarkUp }
    </>
  )
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Entries);
