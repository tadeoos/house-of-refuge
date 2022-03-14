import "../styles/stats.scss";

import ReactDOM from "react-dom";
import React, {useCallback, useEffect, useState} from "react";
import {Chart as ChartJS} from 'chart.js/auto';
import {Chart, Line, Bar} from 'react-chartjs-2';
import Select from "react-dropdown-select";
import {Dropdown} from "react-bootstrap";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import {QuickFilter} from "../components/QuickFilter";
import {groupBy} from "lodash";
import {LoadingSpinner} from "../components/Shared";

const getSourceDisplay = (v) => {
  switch (v) {
    case null:
      return "Zewsząd";
    case "terrain":
      return "Teren";
    case "webform":
      return "Strona";
  }
};

const BarHourChart = ({submissions, defaultAverage = false}) => {
  const [foundByHour, setFoundByHour] = useState([]);
  const [createdByHour, setCreatedByHour] = useState([]);
  const [searchedByHour, setSearchedByHour] = useState([]);

  const [submissionFilter, setSubmissionFilter] = useState(defaultAverage ? [
    {label: "Średnia dzienna", value: "average"}
  ] : [
      {label: "Wszystkie dni", value: "all"}
  ]);

  const labels = [...Array(24).keys()];

  const allDays = [...new Set(submissions.map(s => s.day))];
  console.log("days: ", allDays);

  useEffect(() => {

    let baseSubmissions = submissions;
    const filterValue = submissionFilter[0].value;
    const daysCount = allDays.length;
    if (!["all", "average"].includes(filterValue)) {
      baseSubmissions = submissions.filter(s => s.day === filterValue);
    }

    const createdGgrouped = groupBy(baseSubmissions, (v) => v["created_hour"]);
    const searchedGgrouped = groupBy(baseSubmissions.filter(s => s.first_searched), (v) => v["first_searched_hour"]);
    const matchedGgrouped = groupBy(baseSubmissions.filter(s => s.first_match), (v) => v["first_match_hour"]);

    const createdByHourData = [];
    const searchedByHourData = [];
    const foundByHourData = [];
    labels.forEach(hour => {
      const created = (createdGgrouped[hour] || []).length;
      const searched = (searchedGgrouped[hour] || []).length;
      const matched = (matchedGgrouped[hour] || []).length;
      createdByHourData.push(filterValue === "average" ? Math.ceil(created / daysCount) : created);
      searchedByHourData.push(filterValue === "average" ? Math.ceil(searched / daysCount) : searched);
      foundByHourData.push(filterValue === "average" ? Math.ceil(matched / daysCount) : matched);
    });
    setCreatedByHour(createdByHourData);
    setSearchedByHour(searchedByHourData);
    setFoundByHour(foundByHourData);
  }, [submissions, submissionFilter]);


  return <div className={"bar-chart-container"}>
    <Bar
        height={150}
        width={400}
        data={{
          labels: labels,
          datasets: [
            {
              label: 'Stworzonych zgłoszeń',
              backgroundColor: '#FFD200',
              borderColor: '#FFD200',
              maxBarThickness: 30,
              data: createdByHour,
            },
            {
              label: 'Szukanych zgłoszeń',
              backgroundColor: '#005EAA',
              borderColor: '#005EAA',
              maxBarThickness: 30,
              data: searchedByHour,
            },
            {
              label: 'Znalezionych hostów',
              backgroundColor: '#519872',
              borderColor: '#519872',
              maxBarThickness: 30,
              data: foundByHour,
            },
          ]
        }}
    />
    <div>
      <Select values={submissionFilter} options={[
        {label: "Wszystkie dni", value: "all"},
        {label: "Średnia dzienna", value: "average"},
        ...allDays.map(day => ({label: day, value: day}))
      ]} onChange={(values) => setSubmissionFilter(values)}/>
    </div>
  </div>;
};

const App = ({startDate}) => {

  const [isLoading, setIsLoading] = useState(true);

  const [submissions, setSubmissions] = useState([]);
  const [hosts, setHosts] = useState([]);

  const [baseSubs, setBaseSubs] = useState([]);
  const [allSubsData, setAllSubsData] = useState([]);
  const [successSubsData, setSuccessSubsData] = useState([]);
  const [cancelledSubsData, setCancelledSubsData] = useState([]);
  const [hostsData, setHostsData] = useState([]);


  const [showDataInPeople, setShowDataInPeople] = useState(false);
  const [submissionSource, setSubmissionSource] = useState(null);
  const [cumulative, setCumulative] = useState(false);

  const daysLabels = [...new Set(submissions.map(s => s.day))];

  useEffect(async () => {
    const response = await fetch(`/api/stats/`);
    const result = await response.json();
    setSubmissions(result.data.submissions);
    setHosts(result.data.hosts);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setBaseSubs(submissions);
  }, [submissions]);


  useEffect(() => {
    setBaseSubs(submissions.filter(s => submissionSource ? s.source === submissionSource : true));
  }, [submissionSource]);


  const subFilter = useCallback(
      (day, sub, attr) => {
        let baseCheck;
        if (cumulative) {
          baseCheck = sub[attr] <= day;
        } else {
          baseCheck = sub[attr] === day;
        }
        return baseCheck;
      },
      [cumulative],
  );


  useEffect(() => {
    const allSubs = [];
    const successSubs = [];
    const allHosts = [];
    const cancelledSubs = [];

    daysLabels.forEach(day => {
      let alls = baseSubs.filter(
          s => subFilter(day, s, "day")
      );
      let suc = baseSubs.filter(
          s => subFilter(day, s, "finished_day")
      );
      let cancelled = alls.filter(s => s.status === "cancelled");
      let baseHosts = hosts.filter(
          h => subFilter(day, h, "day")
      );
      if (showDataInPeople) {
        allSubs.push(alls.map(s => s.people_count).reduce((partialSum, a) => partialSum + a, 0));
        successSubs.push(suc.map(s => s.people_count).reduce((partialSum, a) => partialSum + a, 0));
        allHosts.push(baseHosts.map(s => s.people_count).reduce((partialSum, a) => partialSum + a, 0));
        cancelledSubs.push(cancelled.map(s => s.people_count).reduce((partialSum, a) => partialSum + a, 0));
      } else {
        allSubs.push(alls.length);
        successSubs.push(suc.length);
        allHosts.push(baseHosts.length);
        cancelledSubs.push(cancelled.length);
      }
    });
    setAllSubsData(allSubs);
    setSuccessSubsData(successSubs);
    setHostsData(allHosts);
    setCancelledSubsData(cancelledSubs);
  }, [showDataInPeople, cumulative, baseSubs, hosts]);


  return isLoading ? <LoadingSpinner/> :
  <>
    <div className={"stats-line-chart"}>
      <div className={"filters"}>
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size={"sm"}>
            {showDataInPeople ? "Liczba ludzi" : "Liczba rekordów"}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setShowDataInPeople(pd => !pd)}>
              {showDataInPeople ? "Pokaż w liczbie rekordów" : "Pokaż jako liczbę ludzi"}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size={"sm"}>
            {`Źródło: ${getSourceDisplay(submissionSource)}`}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setSubmissionSource(null)}>
              Zewsząd
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSubmissionSource("terrain")}>
              Teren
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSubmissionSource("webform")}>
              Strona
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <QuickFilter label={"Kumulatywnie"}>
          <BootstrapSwitchButton
              size={"sm"}
              checked={cumulative}
              onChange={(checked) => {
                setCumulative(checked);
              }}
          />
        </QuickFilter>
      </div>
      <Line
          datasetIdKey="id"
          height={100}
          width={400}
          data={{
            labels: daysLabels,
            datasets: [
              {
                id: 1,
                label: 'Zgłoszenia',
                backgroundColor: '#FFD200',
                borderColor: '#FFD200',
                data: allSubsData,
              },
              {
                id: 2,
                label: 'Sukcesy',
                backgroundColor: '#519872',
                borderColor: '#519872',
                data: successSubsData,
              },
              {
                id: 3,
                label: 'Anulowane',
                backgroundColor: '#696969',
                borderColor: '#696969',
                data: cancelledSubsData,
              },
              {
                id: 4,
                label: 'Nowi hości',
                backgroundColor: '#005eaa',
                borderColor: '#005eaa',
                data: hostsData,
              },
            ],
          }}
      />
    </div>
    <div className={"row"}>
      <div className={"col-6"}>
        <BarHourChart submissions={baseSubs}/>
      </div>
      <div className={"col-6"}>
        <BarHourChart submissions={baseSubs} defaultAverage={true}/>
      </div>
    </div>
  </>;
};

ReactDOM.render(
    <App {...props}/>,
    // React.createElement(App, window.props),    // gets the props that are passed in the template
    window.react_mount,                                // a reference to the #react div that we render to
);
