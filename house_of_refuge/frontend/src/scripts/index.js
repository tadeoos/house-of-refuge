import "../styles/resources.scss";
import React, {useEffect, useState} from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import {
  getCookie,
  getHelped,
  getLatestHostTimestamp,
  getLatestSubId,
  getRandomInt,
  shouldShowHost,
  strToBoolean,
  SUB_STATE_OPTIONS
} from "./utils";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {ResourceList} from "../components/ResourceList";
import {SOURCE_OPTIONS, SubmissionList} from "../components/SubmissionList";
import useInterval from "use-interval";
import {BrowserRouter, Route, Routes, useSearchParams} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import '../i18n/config';

const CoordinatorsHeader = ({coordinators, helped, hide}) => {
  const [peopleHelped, setPeopleHelped] = useState(helped);
  const { t, i18n } = useTranslation('backoffice');
  const lngs = {
    en: { nativeName: 'English' },
    pl: { nativeName: 'Polski' }
  };
  useInterval(async () => {
    const newHelped = await getHelped();
    setPeopleHelped(newHelped);
  }, 120 * 1000);

  return <div className="panel-header" style={hide ? {display: "none"} : {}}>
    <div>
      <img src="/static/images/logo.svg" alt="logo" style={{height: "76px", margin: "10px 0"}}/>
    </div>
    <div className="coordinators">
      <div className="d-flex justify-content-around">
        <div className={"mx-5 text-center"}>
          <h5>{t('terrain_coordinators')}</h5>
          <ol>{(coordinators.station || []).map(c => <li key={c.user.id}>{c.user.display}</li>)}</ol>
        </div>
        <div className={"mx-5 text-center"}>
          <h5>{t('remote_coordinators')}</h5>
          <ol>{(coordinators.remote || []).map(c => <li key={c.user.id}>{c.user.display}</li>)}</ol>
        </div>
      </div>
      {peopleHelped ?
          <div><h5 className="good-message">
            {t('today_we_helped_count', {pplHelpedCount: peopleHelped})} {"🙏".repeat(Math.floor(peopleHelped / 10))}</h5>
          </div> : <></>}
    </div>
    <div>
      {Object.keys(lngs).map((lng) => (
          <button key={lng}
                  style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }} 
                  type="submit" 
                  onClick={() => i18n.changeLanguage(lng)}>
          {lngs[lng].nativeName}
          </button>
      ))}
    </div>
    <div><a href="/accounts/logout">{t('log_out')}</a></div>
  </div>;
};


const App = ({subs, userData, coordinators, helped}) => {
  let [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  const [activeSub, setActiveSub] = useState(null);
  const [sourceFilter, setSourceFilter] = useState(searchParams.getAll("z").map((i) => SOURCE_OPTIONS[i]));
  const [statusFilter, setStatusFilter] = useState(searchParams.getAll("s").map(i => SUB_STATE_OPTIONS[i]));
  const [peopleFilter, setPeopleFilter] = useState(searchParams.getAll("p").map(v => ({value: v, label: v})));
  const [droppedFilter, setDroppedFilter] = useState(strToBoolean(searchParams.get("d")));
  const [onlyUsers, setOnlyUsers] = useState(strToBoolean(searchParams.get("u")));
  const [onlyTodays, setOnlyTodays] = useState(strToBoolean(searchParams.get("t")));
  const [activeNow, setActiveNow] = useState(strToBoolean(searchParams.get("a")));


  const coordIds = Object.values(coordinators).map(g => g.map(c => c.user.id)).flat();
  const isCoordinator = coordIds.includes(userData.id);
  const [submissions, setSubmissions] = useState(subs);
  const [droppedHosts, setDroppedHosts] = useState([]);
  const [hosts, setHosts] = useState([]);


  const [latestSubChange, setLatestSubChange] = useState(0);
  const [latestHostChange, setLatestHostChange] = useState(0);

  // useEffect(() => {
  //   console.log("parsing");
  //   parseQueryParams(searchParams);
  // }, []);

  useEffect(() => {
    let z = [];
    let s = [];
    let p = [];
    const checkParams = new URLSearchParams();
    if (sourceFilter.length) {
      SOURCE_OPTIONS.forEach((o, i) => {
        if (sourceFilter.includes(o)) {
          z.push(`${i}`);
          checkParams.append("z", `${i}`);
        }
      });
    }
    if (statusFilter.length) {
      SUB_STATE_OPTIONS.forEach((o, i) => {
        if (statusFilter.includes(o)) {
          s.push(`${i}`);
          checkParams.append("s", `${i}`);
        }
      });
    }
    if (peopleFilter.length) {
      peopleFilter.forEach((o) => {
        p.push(`${o.value}`);
        checkParams.append("p", `${o.value}`);
      });
    }
    let params = {z: z, s: s, p: p};
    if (droppedFilter) {
      params.d = "1";
      checkParams.append("d", "1");
    }
    if (onlyUsers) {
      params.u = "1";
      checkParams.append("u", "1");
    }
    if (onlyTodays) {
      params.t = "1";
      checkParams.append("t", "1");
    }
    if (activeNow) {
      params.a = "1";
      checkParams.append("a", "1");
    }
    if (checkParams.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [sourceFilter, statusFilter, droppedFilter, peopleFilter, activeNow, onlyUsers, onlyTodays]);


  // const {search} = useLocation();
  // const latestChange = useRef(0);

  console.log("query:", searchParams.toString(), peopleFilter);

  useInterval(async () => {
    if (activeSub) {
      const latest = parseFloat(await getLatestHostTimestamp());
      console.log("latest", latest, latestHostChange);
      if (latest > latestHostChange) {
        console.log("UPDATING HOSTS");
        const response = await fetch(`/api/zasoby?since=${latestHostChange}`);
        const result = await response.json();
        console.log("got data", result.data);
        const changedHosts = result.data;
        const changedIds = changedHosts.map(s => s.id);
        setHosts((currentHosts) => [
          ...currentHosts.filter(s => !changedIds.includes(s.id)),
          ...changedHosts.filter(h => shouldShowHost(h, userData.id))]
        );
        setLatestHostChange(latest);
      } else {
        console.log("nothing");
      }
    } else {
      // update submissions
      const latest = parseFloat(await getLatestSubId());
      console.log("latest", latest, latestSubChange);
      if (latest > latestSubChange) {
        console.log("UPDATING SUBS");
        const response = await fetch(`/api/zgloszenia?since=${latestSubChange}`);
        const result = await response.json();
        console.log("got data", result.data);
        const newSubs = result.data.submissions;
        const newSubsIds = newSubs.map(s => s.id);
        console.log("new subs: ", newSubs);
        console.log("new sub ids: ", newSubsIds);
        setSubmissions((cS) => [...cS.filter(s => !newSubsIds.includes(s.id)), ...newSubs]);
        // do latest for dropped
        setDroppedHosts(result.data.dropped);
        setLatestSubChange(latest);
      } else {
        console.log("nothing");
      }
    }

  }, getRandomInt(1000, 1200));


  console.log("IsCoordinator: ", isCoordinator, coordIds, userData);

  const clearActiveSub = () => setActiveSub(null);

  const subIsTaken = (sub, isActive = false, discard = false) => {
    console.log("sub taken");
    let fields;
    if (isActive) {
      // no match found... we're clearing the status
      const status = discard ? "cancelled" : "new";
      fields = {"status": status, "matcher_id": null};
    } else {
      fields = {"status": "searching", "matcher_id": userData.id};
    }

    fetch(`/api/sub/update/${sub.id}`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
      }, body: JSON.stringify({"fields": fields})
    }).then(response => response.json()).then(data => {
      console.log('Response: ', data);
      toast(`${data.message}`, {type: data.status});
      if (!isActive) {
        setActiveSub(data.data);
      } else {
        setActiveSub(null);
      }

    }).catch((error) => {
      console.error('Error:', error);
    });
  };


  return <Routes>
    <Route exact path="/jazda" element={
      <>
        {/*<div className="ribbon">*/}
        {/*  Wszystkiego najlepszego dla naszych cudownych wolontariuszek ❤️*/}
        {/*  <i/>*/}
        {/*  <i/>*/}
        {/*  <i/>*/}
        {/*  <i/>*/}
        {/*</div>*/}
        <CoordinatorsHeader coordinators={coordinators} helped={helped} hide={Boolean(activeSub)}/>
        {activeSub ? <ResourceList initialResources={hosts}
                                   isLoading={latestHostChange === 0}
                                   user={userData} sub={activeSub} subHandler={subIsTaken}
                                   clearActiveSub={clearActiveSub}
        /> : <SubmissionList user={userData} subs={submissions} btnHandler={subIsTaken}
                             sourceFilter={sourceFilter} setSourceFilter={(v) => setSourceFilter(v)}
                             statusFilter={statusFilter}
                             isCoordinator={isCoordinator}
                             setStatusFilter={(v) => setStatusFilter(v)}
                             droppedHosts={droppedHosts}
                             isLoading={latestSubChange === 0}
                             userFilterValue={onlyUsers}
                             todayFilterValue={onlyTodays}
                             peopleFilter={peopleFilter}
                             setPeopleFilter={(v) => setPeopleFilter(v)}
                             setUserFilter={(v) => setOnlyUsers(v)}
                             setTodayFilter={(v) => setOnlyTodays(v)}
                             activeNow={activeNow} setActiveNow={(v) => setActiveNow(v)}
                             droppedFilter={droppedFilter} setDropped={(v) => setDroppedFilter(v)}
        />}
      </>}/>
  </Routes>;
};

ReactDOM.render(
    <BrowserRouter><App {...props} /></BrowserRouter>,
    // React.createElement(App, window.props),    // gets the props that are passed in the template
    window.react_mount,                                // a reference to the #react div that we render to
);
