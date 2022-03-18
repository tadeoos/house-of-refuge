import styled from 'styled-components';

const H4 = styled.h4<{ strong?: boolean }>`
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: ${p => p.strong ? 700 : 400};
`;

export default H4;
