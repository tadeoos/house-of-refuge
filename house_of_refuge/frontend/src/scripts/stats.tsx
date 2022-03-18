import "../styles/stats.scss";

import ReactDOM from "react-dom";
import React, {useCallback, useEffect, useState} from "react";
import {Chart, Line, Bar} from 'react-chartjs-2';
import Select from "react-dropdown-select";
import {Dropdown} from "react-bootstrap";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import {groupBy} from "lodash";
import {LoadingSpinner} from "../components/Shared";
import {QuickFilter} from "../components/QuickFilter";

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

const BarHourChart = ({submissions, yAxisMax, maxValueCallback, uniqueId, defaultAverage = false}) => {
  const [foundByHour, setFoundByHour] = useState([] as Array<any>);
  const [createdByHour, setCreatedByHour] = useState([] as Array<any>);
  const [searchedByHour, setSearchedByHour] = useState([] as Array<any>);

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
    const filterValue: string = submissionFilter[0].value;
    const daysCount = allDays.length;
    if (!["all", "average"].includes(filterValue)) {
      baseSubmissions = submissions.filter(s => s.day === filterValue);
    }

    const createdGgrouped = groupBy(baseSubmissions, (v) => v["created_hour"]);
    const searchedGgrouped = groupBy(baseSubmissions.filter(s => s.first_searched), (v) => v["first_searched_hour"]);
    const matchedGgrouped = groupBy(baseSubmissions.filter(s => s.first_match), (v) => v["first_match_hour"]);

    const createdByHourData: Array<number> = [];
    const searchedByHourData: Array<number> = [];
    const foundByHourData: Array<number> = [];
    labels.forEach(hour => {
      const created: number = (createdGgrouped[hour] || []).length;
      const searched: number = (searchedGgrouped[hour] || []).length;
      const matched: number = (matchedGgrouped[hour] || []).length;
      createdByHourData.push(filterValue === "average" ? Math.ceil(created / daysCount) : created);
      searchedByHourData.push(filterValue === "average" ? Math.ceil(searched / daysCount) : searched);
      foundByHourData.push(filterValue === "average" ? Math.ceil(matched / daysCount) : matched);
    });
    setCreatedByHour(createdByHourData);
    setSearchedByHour(searchedByHourData);
    setFoundByHour(foundByHourData);
    maxValueCallback(Math.max(...createdByHourData), uniqueId);
  }, [submissions, submissionFilter]);


  return <div className={"bar-chart-container"}>
    <Bar
        height={150}
        width={400}
        options={{
          scales: {
            y: {suggestedMax: yAxisMax}
          },
        }}
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
      ]} onChange={(values) => setSubmissionFilter(values as any)}/>
    </div>
  </div>;
};

const App = ({startDate}) => {

  const [isLoading, setIsLoading] = useState(true);

  const [submissions, setSubmissions] = useState([] as Array<any>);
  const [hosts, setHosts] = useState([] as Array<any>);

  const [baseSubs, setBaseSubs] = useState([] as Array<any>);
  const [allSubsData, setAllSubsData] = useState([] as Array<any>);
  const [successSubsData, setSuccessSubsData] = useState([] as Array<any>);
  const [cancelledSubsData, setCancelledSubsData] = useState([] as Array<any>);
  const [hostsData, setHostsData] = useState([] as Array<any>);


  const [showDataInPeople, setShowDataInPeople] = useState(false);
  const [submissionSource, setSubmissionSource] = useState('');
  const [cumulative, setCumulative] = useState(false);

  const [perChartMax, setPerChartMax] = useState({} as { [key: string]: number });
  const [barChartYMax, setBarChartYMax] = useState(20);

  const daysLabels = [...new Set(submissions.map(s => s.day))];

  useEffect(() => {
    (async () => {
      const response = await fetch(`/api/stats/`);
      const result = await response.json();
      setSubmissions(result.data.submissions);
      setHosts(result.data.hosts);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    setBaseSubs(submissions);
  }, [submissions]);


  useEffect(() => {
    setBaseSubs(submissions.filter(s => submissionSource ? s.source === submissionSource : true));
  }, [submissionSource]);


  const barChartNewMax = (maxValue, chartId) => setPerChartMax((pcm) => ({...pcm, [chartId]: maxValue}));

  useEffect(() => {
    setBarChartYMax(Math.max(...Object.values(perChartMax)));
  }, [perChartMax]);

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
    const allSubs: Array<any> = [];
    const successSubs: Array<any> = [];
    const allHosts: Array<any> = [];
    const cancelledSubs: Array<any> = [];

    daysLabels.forEach(day => {
      const alls: Array<any> = baseSubs.filter(
          s => subFilter(day, s, "day")
      );
      const suc: Array<any> = baseSubs.filter(
          s => subFilter(day, s, "finished_day")
      );
      const cancelled: Array<any> = alls.filter(s => s.status === "cancelled");
      const baseHosts: Array<any> = hosts.filter(
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
                <Dropdown.Item onClick={() => setSubmissionSource('')}>
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
              options={{
                scales: {
                  y: {beginAtZero: true}
                },
              }}
              data={{
                labels: daysLabels,
                datasets: [
                  {
                    label: 'Zgłoszenia',
                    backgroundColor: '#FFD200',
                    borderColor: '#FFD200',
                    data: allSubsData,
                  },
                  {
                    label: 'Sukcesy',
                    backgroundColor: '#519872',
                    borderColor: '#519872',
                    data: successSubsData,
                  },
                  {
                    label: 'Anulowane',
                    backgroundColor: '#696969',
                    borderColor: '#696969',
                    data: cancelledSubsData,
                  },
                  {
                    label: 'Nowi hości',
                    backgroundColor: '#005EAA',
                    borderColor: '#005EAA',
                    data: hostsData,
                  },
                ],
              }}
          />
        </div>
        <div className={"row"}>
          <div className={"col-6"}>
            <BarHourChart submissions={baseSubs} yAxisMax={barChartYMax} maxValueCallback={barChartNewMax} uniqueId={"bar-1"}/>
          </div>
          <div className={"col-6"}>
            <BarHourChart submissions={baseSubs} yAxisMax={barChartYMax} maxValueCallback={barChartNewMax} uniqueId={"bar-2"}
                          defaultAverage={true}/>
          </div>
        </div>
      </>;
};

ReactDOM.render(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <App {...props}/>,
    // React.createElement(App, window.props),    // gets the props that are passed in the template
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.react_mount,                                // a reference to the #react div that we render to
);
