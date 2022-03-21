import styled from 'styled-components';

const H4 = styled.h4`
  font-size: 18px;
  margin-bottom: ${p => p.noMargin ? '0' : '12px'};
  font-weight: ${p => p.strong ? 700 : 400};
`;

export default H4;
