import {Component} from 'react'
import Cookies from 'js-cookie'
import './index.css'

class Profile extends Component {
  state = {
    profileData: null,
    isLoading: true,
    error: null,
  }

  componentDidMount() {
    this.getProfile()
  }

  getProfile = async () => {
    try {
      const jwtToken = Cookies.get('jwt_token')
      if (!jwtToken) {
        this.setState({error: 'Authentication required'})
        return
      }

      const response = await fetch('https://apis.ccbp.in/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (response.ok) {
        this.setState({profileData: data.profile_details, error: null})
      } else {
        this.setState({error: data.error_msg})
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      this.setState({error: 'Failed to fetch profile'})
    } finally {
      this.setState({isLoading: false})
    }
  }

  renderProfile = () => {
    const {isLoading, error, profileData} = this.state

    if (isLoading) {
      return <div className="loader">Loading...</div>
    }
    if (error) {
      return (
        <div className="error">
          {error}
          <button type="button" onClick={this.getProfile}>
            Retry
          </button>
        </div>
      )
    }
    if (!profileData) {
      return <div className="error">Profile not found</div>
    }
    return (
      <div className="profile">
        <img src={profileData.profile_image_url} alt="profile" />
        <h1>{profileData.name}</h1>
        <p>{profileData.short_bio}</p>
      </div>
    )
  }

  render() {
    return <div className="profile-container">{this.renderProfile()}</div>
  }
}

export default Profile
