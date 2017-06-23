import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import takeRight from 'lodash/takeRight';
import format from 'date-fns/format';
// import { CSVLink } from 'react-csv';

//  reflexbox
import { Flex, Box } from 'reflexbox';

// styles
import 'styles/shared.styl';

// styled components
import { Value, Info, CSVButton } from './styles';

import Table from 'antd/lib/table';
import 'antd/lib/table/style/css';
import Button from 'antd/lib/button';
import 'antd/lib/button/style/css';

import Graph from './Graph';

@inject('store')
@observer
export default class BlueberryMaggot extends Component {
  constructor(props) {
    super(props);
    this.props.store.app.setCSVData();
  }
  render() {
    const {
      ACISData,
      station,
      areRequiredFieldsSet,
      isGraph,
      displayPlusButton,
      state,
      isLoading,
      CSVData,
      endDate
    } = this.props.store.app;
    const { mobile } = this.props;

    const missingDays = () => {
      const idx = ACISData.findIndex(o => o.date === endDate);
      const today = ACISData[idx];
      if (today) return today.missingDays.length;
    };

    // To display the 'forecast text' and style the cell
    const forecastText = date => {
      return (
        <Flex justify="center" align="center" column>
          <Value>
            {date.split('-')[0]}
          </Value>

          <Info style={{ color: 'red' }}>
            {date.split('-')[1]}
          </Info>
        </Flex>
      );
    };

    const emergence = (text, record, i) => {
      if (record.missingDay === 1)
        return (
          <Flex justify="center" align="center">
            <Value>
              No data
            </Value>
          </Flex>
        );
      if (record.cdd > 913) {
        return (
          <Flex justify="center" align="center" column>
            <Value>
              {record.cdd}
              <span style={{ color: 'red', marginLeft: '5px' }}>
                {record.cumulativeMissingDays > 0
                  ? `(+${record.cumulativeMissingDays})`
                  : null}
              </span>
            </Value>
            {mobile
              ? <span style={{ color: '#108EE9' }}>Emergence</span>
              : <Info
                  mt={1}
                  col={7}
                  lg={4}
                  md={4}
                  sm={7}
                  style={{ color: '#108EE9' }}
                >
                  Emergence
                </Info>}
          </Flex>
        );
      }
      return (
        <Flex justify="center" align="center" column>
          <Value>
            {record.cdd}
            <span style={{ color: 'red', marginLeft: '10px' }}>
              {record.cumulativeMissingDays > 0
                ? `(+${record.cumulativeMissingDays})`
                : null}
            </span>
          </Value>
        </Flex>
      );
    };

    const description = record => {
      if (record.missingDays.length > 0) {
        return (
          <Flex style={{ fontSize: '.6rem' }} column>
            <Box col={12} lg={6} md={6} sm={12}>
              <Box col={12} lg={12} md={12} sm={12}>
                {record.missingDays.length > 1
                  ? <div>
                      No data available for the following
                      {' '}
                      {record.cumulativeMissingDays}
                      {' '}
                      dates:
                      {' '}
                    </div>
                  : <div>No data available for the following date:</div>}
              </Box>
            </Box>
            <br />
            <Box col={12} lg={6} md={6} sm={12}>
              {record.missingDays.map((date, i) =>
                <div key={i}>
                  - {date}
                </div>
              )}
            </Box>
          </Flex>
        );
      }
      return null;
    };

    const columns = [
      {
        title: 'Date',
        className: 'table',
        dataIndex: 'dateTable',
        key: 'dateTable',
        render: date => forecastText(date)
      },
      {
        title: 'Degree Days',
        children: [
          {
            title: '50˚F BE',
            className: 'table',
            dataIndex: 'dd',
            key: 'dd'
          },
          {
            title: 'Accumulation from Jan 1st',
            className: 'table',
            dataIndex: 'cdd',
            key: 'cdd',
            render: (text, record, i) => emergence(text, record, i)
          }
        ]
      },
      {
        title: 'Temperature (˚F)',
        children: [
          {
            title: 'Min',
            className: 'table',
            dataIndex: 'Tmin',
            key: 'Tmin'
          },
          {
            title: 'Max',
            className: 'table',
            dataIndex: 'Tmax',
            key: 'Tmax'
          },
          {
            title: 'Avg',
            className: 'table',
            dataIndex: 'Tavg',
            key: 'Tavg'
          }
        ]
      }
    ];

    return (
      <div>
        {!isLoading &&
          <Flex column mt={2}>
            <Flex>
              <Box>
                {!mobile
                  ? <h2>
                      <i>Blueberry Maggot</i> Results for {' '}
                      <span style={{ color: '#C44645' }}>
                        {station.name}, {state.postalCode}
                      </span>
                    </h2>
                  : <h3>
                      <i>Blueberry Maggot</i> Results for {' '}
                      <span style={{ color: '#C44645' }}>
                        {station.name}, {state.postalCode}
                      </span>
                    </h3>}
              </Box>
            </Flex>

            <Flex mt={1} column>
              <Box>
                <i>
                  Blueberry maggot emergence is predicted to occur when
                  approximately 913 degree days, base 50 F, have accumulated
                  from January 1st.
                </i>
              </Box>
            </Flex>

            <Flex mt={2} justify="space-between" align="baseline">
              <Box mt={2}>
                <h3>
                  Accumulated degree days (base 50°F) through{' '}
                  {format(endDate, 'MM/DD/YYYY')}: {station.name},{' '}
                  {state.postalCode} (
                  {` ${missingDays()}`} days missing )
                </h3>
              </Box>

              <Box>
                <a
                  target="_blank"
                  href={`http://forecast.weather.gov/MapClick.php?textField1=${station.lat}&textField2=${station.lon}`}
                  type="secondary"
                >
                  Forecast Details
                </a>
              </Box>

              <Box>
                <Button type="secondary" icon="download">
                  <CSVButton
                    data={CSVData.slice()}
                    filename={'blueberryMaggotModel.csv'}
                    target="_blank"
                  >
                    Download CSV
                  </CSVButton>
                </Button>
              </Box>
            </Flex>

            <Flex justify="center">
              <Box mt={1} col={12} lg={12} md={12} sm={12}>
                {displayPlusButton
                  ? <Table
                      bordered
                      size={mobile ? 'small' : 'middle'}
                      columns={columns}
                      rowKey={record => record.dateTable}
                      loading={ACISData.length === 0}
                      pagination={false}
                      dataSource={
                        areRequiredFieldsSet ? takeRight(ACISData, 8) : null
                      }
                      expandedRowRender={record => description(record)}
                    />
                  : <Table
                      bordered
                      size={mobile ? 'small' : 'middle'}
                      columns={columns}
                      rowKey={record => record.dateTable}
                      loading={ACISData.length === 0}
                      pagination={false}
                      dataSource={
                        areRequiredFieldsSet ? takeRight(ACISData, 8) : null
                      }
                    />}
              </Box>
            </Flex>
            <Flex mt={2}>
              <i>
                <em style={{ color: 'black' }}>
                  Disclaimer: These are theoretical predictions and forecasts.
                </em>
                The theoretical models predicting pest development or disease
                risk
                use the weather data collected (or forecasted) from the weather
                station location. These results should not be substituted for
                actual observations of plant growth stage, pest presence, and
                disease occurrence determined through scouting or insect
                pheromone traps.
              </i>
            </Flex>
            {isGraph && <Graph />}
          </Flex>}
      </div>
    );
  }
}
