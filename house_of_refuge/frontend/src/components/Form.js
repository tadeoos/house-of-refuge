import styled from 'styled-components';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 360px;
  margin-top: 32px;
  margin-bottom: 32px;
`;

const Label = styled.label`
  text-align: left;
  margin-top: 40px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  height: 40px; 
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 3px; 
  border: 1px solid #898F9C;
`;


const Radio = styled.input`
  margin-top: 10px;
  margin-bottom: 10px;
`;



const Button = styled.button`
  margin-top: 30px; 
  padding: 0;
  margin: 0;
  cursor: pointer;
  width: 200px;
  height: 40px;

  `;
const Form = ({ formik }) => {

    return (
        <StyledForm onSubmit={formik.handleSubmit} >
            <Label htmlFor="name">Imię i nazwisko</Label>
            <Input
                id="name"
                name="name"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.name}
            />
            <Label htmlFor="about_info">Powiedz coś o sobie - ile masz lat? Z kim mieszkasz (jeśli przyjmujesz kogoś u siebie)?</Label>
            <Input
                id="about_info"
                name="about_info"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.about_info}
            />

            <Label id="resource">Zasób </Label>
            <label>
                <Radio
                    type="radio"
                    name="resource"
                    value="home"
                    onChange={formik.handleChange}
                />
                Dom
            </label>
            <label>
                <Radio
                    type="radio"
                    name="resource"
                    value="flat"
                    onChange={formik.handleChange}
                />
                Mieszkanie
            </label>
            <label>
                <Radio
                    type="radio"
                    name="resource"
                    value="room"
                    onChange={formik.handleChange}
                />
                Pokój
            </label>
            <label>
                <Radio
                    type="radio"
                    name="resource"
                    value="couch"
                    onChange={formik.handleChange}
                />
                Kanapa
            </label>

            {/* <Label htmlFor="city">Miasto</Label>
            <Input
                id="city"
                name="city"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.city}
            />
            <Label htmlFor="zip_code">Kod poczotwy</Label>
            <Input
                id="zip_code"
                name="zip_code"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.zip_code}
            /> */}

            <Button type="submit">Wyślij</Button>

        </StyledForm>
    );
};

export default Form;
