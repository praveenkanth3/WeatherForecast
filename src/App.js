import { useState } from 'react';
import style from './App.module.scss';
import { Modal, Input, notification, Button } from 'antd';
import { initialRegisteringValue } from './WeatherForecast.constant';

function App() {
  const [api, contextHolder] = notification.useNotification();
  const [modalVisible, setModalVisible] = useState(true)
  const [user, setUser] = useState({});
  const [cityInfo,  setCityInfo] = useState('');
  const [signInDecision, setSignInDecision] = useState('');
  const [foreCastInfo, setForeCastInfo] = useState({});
  const [registeringUser, setRegisteringUser] = useState(initialRegisteringValue);
  const [signinUser, setSignInUser] = useState({ mobileNumber: '', password: '' })
  const onClickModelSubmit = () => {
    if (signInDecision === 'Sign Up') {
      localStorage.setItem('registeredUser', JSON.stringify(registeringUser));
      setRegisteringUser(initialRegisteringValue);
    }
    else {
      const registered = JSON.parse(localStorage.getItem('registeredUser'));
      if (signinUser.mobileNumber === registered.mobile && signinUser.password === registered.password) {
        setUser(registered);
        api.info({
          message: `Success`,
          description: 'Successfully loged in',
          placement: 'bottom',
        });
        setSignInUser({ mobileNumber: '', password: '' });
        setModalVisible(false);
      }
      else {
        api.info({
          message: `Error`,
          description: 'Mobile number or Password Incorrect',
          placement: 'bottom',
        });
      }
    }
  }
  const onClickLocationSubmit = async () => {
    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${cityInfo}&days=3`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '',
        'X-RapidAPI-Host': ''
      }
    };
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if(result.location){
        setForeCastInfo(result);
      }
      else{
        api.info({
          message: `Error`,
          description: 'city not found',
          placement: 'bottom',
        });
      }
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className={style.App}>
      {contextHolder}
      <div className={style.headerSection}>
        <h1>Weather Forecast</h1>
        {!user.mobile && (
          <div className={style.logInSection}>
            <div onClick={(e) => { e.stopPropagation(); setModalVisible(true); setSignInDecision('Sign In'); }}>Sign In</div>
            <div onClick={(e) => { e.stopPropagation(); setModalVisible(true); setSignInDecision('Sign Up'); }}>Sign Up</div>
          </div>)}
        {user.mobile && (<div className={style.logoutBtn} onClick={(e) => { e.stopPropagation(); setUser({}); }} title={user.name}>Logout</div>)}
      </div>
      <div className={style.contentSection}>
        {!user.name && (<h1>Please sign in to continue</h1>)}
        {user.name && (
          <div className={style.content}>
            <Input placeholder='Enter the Location'  value={cityInfo} onChange={(e) => { setCityInfo(e.target.value)}} />
            <Button onClick={onClickLocationSubmit}>Submit</Button>
          </div>
        )}
          {foreCastInfo?.forecast?.forecastday && user.name && (<div className={style.tableContent}>
            <table>
              <tr>
                <th>Date</th>
                <th>Humitity</th>
                <th>temp</th>
                <th>wind speed</th>
                <th>uv</th>
                <th>rain</th>
                <th>snow</th>
                <th>condition</th>
              </tr>
              {(foreCastInfo?.forecast?.forecastday || []).map((val) =>{
              return(
                <tr>
                  <td>{val.date}</td>
                  <td>{val.day.avghumidity}</td>
                  <td>{val.day.avgtemp_c}</td>
                  <td>{val.day.maxwind_kph}</td>
                  <td>{val.day.uv}</td>
                  <td>{val.day.daily_chance_of_rain}</td>
                  <td>{val.day.daily_chance_of_snow}</td>
                  <td>{val.day.condition.text}</td>
                </tr>
              )
            })}
            </table>
          </div>)}
      </div>
      {modalVisible && (
        <Modal
          title={!signInDecision ? "Choose One" : signInDecision}
          onCancel={() => { setModalVisible(false) }}
          footer={
            signInDecision !== '' ? (<div>
              <Button type="primary" onClick={() => { setSignInDecision(signInDecision === 'Sign In' ? 'Sign Up' : 'Sign In') }}>{signInDecision === 'Sign In' ? 'Sign Up Page' : 'Sign In Page'}</Button>
              <Button type="primary" onClick={onClickModelSubmit}>Submit</Button>
            </div>) : <></>
          }
          maskClosable
          open={modalVisible}
        >
          <div className={style.signInDecisionModelContainer}>
            {!signInDecision && (<div className={style.FooterContent}>
              <Button type="primary" onClick={() => { setSignInDecision('Sign In') }}>Sign in</Button>
              <Button type="primary" onClick={() => { setSignInDecision('Sign Up') }}>Sign up</Button>
            </div>)}
            {signInDecision === 'Sign In' && (
              <div className={style.signInModalContent}>
                <Input type='number' onWheel={(e) => e.target.blur()} placeholder='Mobile Number' value={signinUser.mobileNumber} onChange={(e) => { setSignInUser({ ...signinUser, mobileNumber: e.target.value }) }} />
                <Input value={signinUser.password} placeholder='Password' onChange={(e) => { setSignInUser({ ...signinUser, password: e.target.value }) }} />
              </div>
            )}
            {signInDecision === 'Sign Up' && (
              <div>
                <div className={style.signUpModalContent}>
                  <Input placeholder='Name' value={registeringUser.name} onChange={(e) => { setRegisteringUser({ ...registeringUser, name: e.target.value.trim() }) }} />
                  <Input type='number' onWheel={(e) => e.target.blur()} placeholder='Mobile' value={registeringUser.mobile} onChange={(e) => { if (e.target.value.length !== 0 && e.target.value.length < 11) setRegisteringUser({ ...registeringUser, mobile: e.target.value.trim() }) }} />
                  <Input value={registeringUser.email} placeholder='Email' onChange={(e) => { setRegisteringUser({ ...registeringUser, email: e.target.value.trim() }) }} />
                  <Input value={registeringUser.address} placeholder='Address' onChange={(e) => { setRegisteringUser({ ...registeringUser, address: e.target.value.trim() }) }} />
                  <Input value={registeringUser.password} placeholder='Create Password' onChange={(e) => { setRegisteringUser({ ...registeringUser, password: e.target.value.trim() }) }} />
                </div>

              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
