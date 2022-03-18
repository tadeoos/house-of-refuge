import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../theme';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledMask = styled.div`
  z-index: 98;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.6);
`;

const SpinnerWrappper = styled.div<{full?: boolean, spinnerSize: number}>`
  z-index: 99;
  text-align: center;
  left: 0;
  right: 0;
  position: fixed;
  top: ${({ full }) => (full ? 'calc(50% - 30px)' : '50%')};
  margin-top: ${({ spinnerSize }) => spinnerSize / -2 + 'px'};
`;

const StyledSpinner = styled.svg`
  animation: ${rotate} 1s infinite linear;
`;

const Spinner = ({ full }) => {
  const spinnerSize = full ? 90 : 28;
  return (
    <div style={{ position: 'relative' }}>
      <SpinnerWrappper full={full} spinnerSize={spinnerSize}>
        <span role="img" aria-label="loading" style={{ fontSize: spinnerSize }}>
          <StyledSpinner
            viewBox="0 0 1024 1024"
            focusable="false"
            data-icon="loading"
            width="1em"
            height="1em"
            fill={colors.optimisticYellow}
            aria-hidden="true"
          >
            <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
          </StyledSpinner>
        </span>
      </SpinnerWrappper>
      {full && <StyledMask />}
    </div>
  );
};

export default Spinner;
