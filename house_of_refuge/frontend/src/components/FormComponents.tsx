import styled from 'styled-components';

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 100%;
  max-width: 400px;
  margin-top: 32px;
  margin-bottom: 32px;
  padding: 6px;
`;

export  const Label = styled.label<{type?: string}>`
    font-weight: 700;
    font-size: 16.88px;
    line-height: 19px;
    margin-top: 28px;
    margin-left: ${p => p.type === 'checkbox' ? '20px' : 'initial'};
    position: ${p => p.type === 'checkbox' ? 'absolute' : 'initial'};
    cursor: ${p => p.type === 'checkbox' ? 'pointer' : 'initial'};
`;


export const Input = styled.input.attrs(({ type }) => ({
    as: type === 'textarea' ? type : 'input'
  }))`
    height: ${p => p.type === 'checkbox' ? '22px' : '44px'};
    cursor: ${p => p.type === 'checkbox' ? 'pointer' : 'initial'};
    padding: 0 8px;
    box-sizing: border-box;
    border-radius: 3px;
    border: 1px solid #898F9C;
    min-height: ${p => p.type === 'textarea' ? '70px' : 'initial'};
    max-height: ${p => p.type === 'textarea' ? '140px' : 'initial'};
    padding-top: ${p => p.type === 'textarea' ? '8px' : 'initial'};
    margin-top: ${p => p.type === 'checkbox' ? '27px' : '10px'};

  `;


  export const SubHeading = styled.span<{indent?: boolean}>`
  font-weight: 400;
  font-size: 13.5px;
  line-height: 16px;
  margin-top: 3px;
  margin-left: ${p => p.indent ? '20px' : 0};
`;

export const CustomIntRange = styled.span`
  justify-content: space-between;
  display: flex;

   > input {
       width: calc(50% - 8px);
   }
`;


export const RadioField = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
`;

export const RadioChoice = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 28px;

  span {
      margin-left: 6px;
      font-size: 14px;
  }
`;

export const SelectField = styled.select`
  height: 44px;
  cursor: pointer;
  padding-left: 6px;
  margin-top: 10px;
`;


export const Button = styled.button<{outlined?: boolean}>`
  padding: 0;
  cursor: pointer;
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 150px;
  color: ${p => p.outlined ? '#000' : 'white'};
  background-color: ${p => p.outlined ? 'white' : '#000'};
  border: ${p => p.outlined ? `1px solid #000` : 'initial'};

`;

export const Alert = styled.div`
  font-size: 13px;
  margin-top: 6px;
  color: #d93025;
`;

export const Field = styled.div<{alert: boolean}>`
  display: flex;
  flex-direction: column;

  * {
    color:  ${p => p.alert ? '#D93025' : 'inherit'};
  }
`;

export const Success = styled.div`
  font-size: 21px;
  text-align: center;
`;
