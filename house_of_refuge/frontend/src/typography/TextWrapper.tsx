import styled from 'styled-components';
import { colors } from '../theme';

const TextWrapper = styled.div<{ maxWidth?: number }>`
  max-width: ${p => p.maxWidth ? p.maxWidth + 'px' : '570px'};
  padding: 0 12px 48px;
  color: ${colors.veryDarkGrey};
`;

export default TextWrapper;
