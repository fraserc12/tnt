import styled from "styled-components";
import { Card } from "antd";

export const StyledCard = styled(Card)`
  && {
    padding-bottom: 5px;
    margin-bottom: 24px;
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;

  && > * {
    margin-bottom: 12px;
  }
`;

export const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;

  background-color: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 3px;

  & > * {
    margin-left: 12px;
  }
`;
