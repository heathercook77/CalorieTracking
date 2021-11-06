import React, { Component } from 'react';
import decodeToken from '../Auth/authUtil';
import deploymentConfig from '../Deployment/deploymentConfig';
import update from 'immutability-helper';
import SearchFood from './SearchFood';
import FoodsPanel from './FoodsPanel';

class AddFoodView extends Component {

	constructor(props) {
		super(props);
		this.state = {
			searchTerm: '',
			searchResults: [],
			searchError: false,
			foodsPanelTab: this.props.tab ? this.props.tab : 1,
			recentFoods: [],
			myFoods: [],
			loading: true
		}
	}

	componentDidMount() {
		const userId = decodeToken(localStorage.getItem('token')).userId;
		// get recent consumptions
		fetch(deploymentConfig().apiUrl + '/api/consumptions?type=recent&userId=' + userId + '&token=' + localStorage.getItem('token'))
			.then((resp) => resp.json())
			.then(recentFoods => {
				this.setState({
					recentFoods: recentFoods,
					loading: false
				});
			});
	}

	componentWillReceiveProps(nextProps) {
		// update tab when new tab is passed down from AddFoodViewContainer
		if(nextProps.tab) {
			if(nextProps.tab !== this.state.foodsPanelTab) {
				this.setState({
					foodsPanelTab: nextProps.tab
				}, () => {
					window.scrollTo(0, 0);
				});
			}
		}
	}

	switchTabs(tabNumber) {
		this.setState({foodsPanelTab: tabNumber});
	}

	handleSearchChange(term) {
		this.setState({
			searchTerm: term,
			foodsPanelTab: 0
		});

		// use timeout to prevent excessive/premature API calls
		if(this.apiCallTimeout) {
			clearTimeout(this.apiCallTimeout);
		}
		// force API call when term length is 4 (for responsiveness to new/adjusted searches)
		if(term.length !== 4) {
			this.apiCallTimeout = setTimeout(() => this.getSearchResults(term), 300);
		} else {
			this.getSearchResults(term);
		}
	}

	getSearchResults(searchTerm) {
		let term = encodeURIComponent(searchTerm);
			fetch(deploymentConfig().apiUrl + '/api/foods?q=' + term)
			.then((resp) => {
				if(resp.ok) {
					resp.json()
						.then(results => {
							this.setState({
								searchResults: results,
								searchError: false
							});
						});
				} else {
					this.setState({searchError: true});
				}
			});
	}

	getUserFoods() {
		const userId = decodeToken(localStorage.getItem('token')).userId;

		// get user foods
		fetch(deploymentConfig().apiUrl + '/api/foods/user/' + userId + '?token=' + localStorage.getItem('token'))
		.then((resp) => resp.json())
		.then(userFoods => {
			this.setState({myFoods: userFoods});
		});
	}

	deleteUserFoodItem(foodItemId) {
		fetch(deploymentConfig().apiUrl + '/api/foods/' + foodItemId + '?token=' + localStorage.getItem('token'), {method: 'POST'})
      .then(res => {
        if(res.ok) {
          let foodItem = this.state.myFoods.find(food => food.foodItemId === foodItemId);
          let foodItemIndex = this.state.myFoods.indexOf(foodItem);
          let newState = update(this.state, {
            myFoods: {$splice: [[foodItemIndex, 1]]}
          });
          this.setState(newState);
        } else {
          alert('This food item could not be deleted.');
        }
      });
	}

  render() {
    return (
      <div className="AddFoodView content-container">
        <SearchFood 
        	mealName={this.props.mealName}
        	searchTerm={this.state.searchTerm}
					handleSearchChange={this.handleSearchChange.bind(this)}
					mealGroupContext={this.props.mealGroupContext}
      	 />
        <FoodsPanel 
        	mealName={this.props.mealName}
        	currentTab={this.state.foodsPanelTab}
      		handleSwitchTab={this.switchTabs.bind(this)} 
      		searchResults={this.state.searchResults}
      		searchError={this.state.searchError}
      		recentFoods={this.state.recentFoods}
      		getUserFoods={this.getUserFoods.bind(this)}
      		myFoods={this.state.myFoods}
      		deleteUserFoodItem={this.deleteUserFoodItem.bind(this)}
      		loading={this.state.loading}
					day={this.props.day}
					mealGroupContext={this.props.mealGroupContext}
    		/>
      </div>
    );
  }
}

export default AddFoodView;
