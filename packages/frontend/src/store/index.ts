import { createStore } from 'vuex';
import ui from './modules/ui';
import auth from './modules/auth';
import portfolios from './modules/portfolios';
import ai from './modules/ai';
import analytics from './modules/analytics';

export default createStore({
  modules: {
    ui,
    auth,
    portfolios,
    ai,
    analytics
  },
});