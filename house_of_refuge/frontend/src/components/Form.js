import styled from 'styled-components';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 400px;
  margin-top: 32px;
  margin-bottom: 32px;
`;

const Label = styled.label`
  text-align: left;
  margin-top: 28px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  height: 40px; 
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 3px; 
  border: 1px solid #898F9C;
`;

const Radiolabel = styled.label`
  cursor: pointer;
  span {
      margin-left: 6px;
  }
`;

const Radio = styled.input`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  margin-top: 32px; 
  padding: 0;
  cursor: pointer;
  width: 100%;
  height: 40px;
  border: none;
  background-color: black;
  border-radius: 150px;
  color: #fff;
  background-color: #000;

`;

const Alert = styled.div`
  font-size: 13px;
  margin-top: 6px;
  color: #d93025;
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
            {formik.errors.name && formik.touched.name ? (
                <Alert role="alert"> {formik.errors.name} </Alert>
            ) : null}

            <Label htmlFor="about_info">Powiedz coś o sobie - ile masz lat? Z kim mieszkasz (jeśli przyjmujesz kogoś u siebie)?</Label>
            <Input
                id="about_info"
                name="about_info"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.about_info}
            />
            {formik.errors.about_info && formik.touched.about_info ? (
                <Alert role="alert"> {formik.errors.about_info} </Alert>
            ) : null}

            <Label id="resource">Zasób </Label>
            <Radiolabel>
                <Radio
                    type="radio"
                    name="resource"
                    value="home"
                    onChange={formik.handleChange}
                />
                <span>Dom</span>
            </Radiolabel>
            <Radiolabel>
                <Radio
                    type="radio"
                    name="resource"
                    value="flat"
                    onChange={formik.handleChange}
                />
                <span>Mieszkanie</span>
            </Radiolabel>
            <Radiolabel>
                <Radio
                    type="radio"
                    name="resource"
                    value="room"
                    onChange={formik.handleChange}
                />
                <span>Pokój</span>
            </Radiolabel>
            <Radiolabel>
                <Radio
                    type="radio"
                    name="resource"
                    value="couch"
                    onChange={formik.handleChange}
                />
                <span>Kanapa</span>
            </Radiolabel>
            {formik.errors.resource && formik.touched.resource ? (
                <Alert role="alert"> {formik.errors.resource} </Alert>
            ) : null}

            <Label htmlFor="city">Miasto</Label>
            <Input
                id="city"
                name="city"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.city}
            />
            {formik.errors.city && formik.touched.city ? (
                <Alert role="alert"> {formik.errors.city} </Alert>
            ) : null}

            <Label htmlFor="zip_code">Kod poczotwy</Label>
            <Input
                id="zip_code"
                name="zip_code"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.zip_code}
            />
            {formik.errors.zip_code && formik.touched.zip_code ? (
                <Alert role="alert"> {formik.errors.zip_code} </Alert>
            ) : null}

            <Label htmlFor="address">Adres (ulica, numer budynku, numer mieszkania)</Label>
            <Input
                id="address"
                name="address"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.address}
            />
            {formik.errors.address && formik.touched.address ? (
                <Alert role="alert"> {formik.errors.address} </Alert>
            ) : null}

            <Label htmlFor="people_to_accommodate">Ile osób jesteś w stanie wesprzeć tak, by miały godne warunki pobytu?</Label>
            <Input
                id="people_to_accommodate"
                name="people_to_accommodate"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.people_to_accommodate}
            />
            {formik.errors.people_to_accommodate && formik.touched.people_to_accommodate ? (
                <Alert role="alert"> {formik.errors.people_to_accommodate} </Alert>
            ) : null}

            <Label htmlFor="costs">Koszty pobytu (czynsz, opłaty, koszty najmu lub darmowy pobyt)</Label>
            <Input
                id="costs"
                name="costs"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.costs}
            />
            {formik.errors.costs && formik.touched.costs ? (
                <Alert role="alert"> {formik.errors.costs} </Alert>
            ) : null}

            <Label htmlFor="availability">Od kiedy udostępniasz nocleg?</Label>
            <Input
                id="availability"
                name="availability"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.availability}
            />
            {formik.errors.availability && formik.touched.availability ? (
                <Alert role="alert"> {formik.errors.availability} </Alert>
            ) : null}

            <Label htmlFor="accommodation_length">Na jak długo udostępniasz nocleg?</Label>
            <Input
                id="accommodation_length"
                name="accommodation_length"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.accommodation_length}
            />
            {formik.errors.accommodation_length && formik.touched.accommodation_length ? (
                <Alert role="alert"> {formik.errors.accommodation_length} </Alert>
            ) : null}

            <Label htmlFor="details">Garść informacji o miejscu (obecność zwierząt, języki obce lokatorów i lokatorek, dostępna pościel i ręczniki, inne)</Label>
            <Input
                id="details"
                name="details"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.details}
            />
            {formik.errors.details && formik.touched.details ? (
                <Alert role="alert"> {formik.errors.details} </Alert>
            ) : null}

            <Label id="transport">Czy jesteś w stanie przyjechać po osoby, którym udzielisz schronienia na dworzec/w podane miejsce pobytu?</Label>
            <Radiolabel>
                <Radio
                    type="radio"
                    name="transport"
                    value="warsaw"
                    onChange={formik.handleChange}
                />
                <span>Tak</span>, na terenie Warszawy
            </Radiolabel>
            <Radiolabel>
                <Radio
                    type="radio"
                    name="transport"
                    value="poland"
                    onChange={formik.handleChange}
                />
                <span>Tak</span>, na terenie Warszawy i Polski
            </Radiolabel>
            <Radiolabel>
                <Radio
                    type="radio"
                    name="transport"
                    value="none"
                    onChange={formik.handleChange}
                />
                <span>Nie</span>
            </Radiolabel>
            {formik.errors.transport && formik.touched.transport ? (
                <Alert role="alert"> {formik.errors.transport} </Alert>
            ) : null}

            <Label htmlFor="phone_number">Twój numer telefonu</Label>
            <Input
                id="phone_number"
                name="phone_number"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.phone_number}
            />
            {formik.errors.phone_number && formik.touched.phone_number ? (
                <Alert role="alert"> {formik.errors.phone_number} </Alert>
            ) : null}

            <Label htmlFor="backup_phone_number">Awaryjny numer telefonu (dodatkowa osoba kontaktowa)</Label>
            <Input
                id="backup_phone_number"
                name="backup_phone_number"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.backup_phone_number}
            />
            {formik.errors.backup_phone_number && formik.touched.backup_phone_number ? (
                <Alert role="alert"> {formik.errors.backup_phone_number} </Alert>
            ) : null}

            <Label htmlFor="email">Twój mail</Label>
            <Input
                id="email"
                name="email"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.email}
            />
            {formik.errors.email && formik.touched.email ? (
                <Alert role="alert"> {formik.errors.email} </Alert>
            ) : null}

            <Label htmlFor="extra">Dodatkowe uwagi</Label>
            <Input
                id="extra"
                name="extra"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.extra}
            />
            {formik.errors.extra && formik.touched.extra ? (
                <Alert role="alert"> {formik.errors.extra} </Alert>
            ) : null}

            <Button type="submit">Wyślij</Button>

        </StyledForm>
    );
};

export default Form;
