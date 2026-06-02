import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home.jsx";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import ReviewResume from "./pages/ReviewResume";
import CoverLetterGenerator from "./pages/CoverLetterGenerator";
// import GrammarEnhancer from "./pages/GrammarEnhancer";
import EmailGenerator from "./pages/EmailGenerator";
import ReadmeGenerator from "./pages/ReadmeGenerator";
import ResumeBuilder from "./pages/ResumeBuilder";
import AtsScoreChecker from "./pages/AtsScoreChecker";
import JobDescriptionAnalyzer from "./pages/JobDescriptionAnalyzer";
// import LearningPlanGenerator from "./pages/LearningPlanGenerator";
// import CodeSnippetGenerator from "./pages/CodeSnippetGenerator";
// import LinkedInPostGenerator from "./pages/LinkedInPostGenerator";
import JobTracker from "./pages/JobTracker";
import { Toaster } from "react-hot-toast";

const App = () => {

  return (
    <div >
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/ai' element={<Layout />} >
          <Route index element={<Dashboard />} />
          <Route path='resume-review' element={<ReviewResume />} />
          <Route path='resume-builder' element={<ResumeBuilder />} />
          <Route path='ats-checker' element={<AtsScoreChecker />} />
          <Route path='cover-letter' element={<CoverLetterGenerator />} />
          {/* <Route path='grammar-enhancer' element={<GrammarEnhancer />} /> */}
          <Route path='job-email-generator' element={<EmailGenerator />} />
          <Route path='job-description-analyzer' element={<JobDescriptionAnalyzer />} />
          <Route path='readme-generator' element={<ReadmeGenerator />} />
          {/* <Route path='learning-plan' element={<LearningPlanGenerator />} /> */}
          {/* <Route path='code-snippet-generator' element={<CodeSnippetGenerator />} /> */}
          {/* <Route path='linkedin-post-generator' element={<LinkedInPostGenerator />} /> */}
          <Route path='job-tracker' element={<JobTracker />} />
        </Route>
      </Routes>
    </div>



  )
}

export default App
