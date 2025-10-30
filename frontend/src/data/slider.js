import img1 from "../assets/images/1.jpg"
import img2 from "../assets/images/2.jpg"
import img3 from "../assets/images/3.jpg"
import img4 from "../assets/images/4.jpg"

export const heroSlides = [
  {
    id: 1,
    title: "Welcome to Our Community",
    subtitle: "Connect, Learn, and Grow Together",
    description: "Join thousands of members in building a vibrant, supportive community",
    image: img1,
    cta: {
      // Changed to target the members section on the Home page
      primary: { text: "Explore Community", link: "#services" },
      secondary: { text: "Join Us", link: "/join" }
    }
  },
  {
    id: 2,
    title: "Join Exciting Events",
    subtitle: "Workshops, Seminars & Networking",
    description: "Participate in engaging events and connect with like-minded individuals",
    image: img2,
    cta: {
      primary: { text: "View Activities", link: "#activity" },
      secondary: { text: "Upcoming Events", link: "#activity" }
    }
  },
  {
    id: 3,
    title: "Meet Amazing People",
    subtitle: "Build Meaningful Connections",
    description: "Connect with community members, mentors, and industry leaders",
    image: img3,
    cta: {
      primary: { text: "Meet Members", link: "#members" },
      secondary: { text: "Find Mentors", link: "#members" }
    }
  },
  {
    id: 4,
    title: "Learn & Grow",
    subtitle: "Access Premium Learning Resources",
    description: "Enhance your skills with tutorials, courses, and expert guidance",
    image: img4,
    cta: {
      primary: { text: "Explore Resources", link: "#services" },
      secondary: { text: "Start Learning", link: "#browse" }
    }
  },
  {
    id: 5,
    title: "Discover Our E-Library",
    subtitle: "Access Thousands of Books for Free",
    description: "Browse our extensive collection of books, journals, and educational resources",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&h=1080&fit=crop",
    cta: {
      primary: { text: "Browse Library", link: "#browse" },
      secondary: { text: "Learn More", link: "#services" }
    }
  }
];
