import styled from 'styled-components';

const H3 = styled.h3`
  font-size: 28px;
  font-weight: ${p => p.strong ? 700 : 400};
  margin-bottom: 20px;
  margin-top: ${p => p.spaceTop ? '48px' : '0px'};
`;

export default H3;
