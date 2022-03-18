import styled from 'styled-components';

const H2 = styled.h2<{ strong?: boolean }>`
  font-size: 34px;
  margin-bottom: 24px;
  font-weight: ${p => p.strong ? 700 : 400};
`;

export default H2;
