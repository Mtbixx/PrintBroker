import { Route, Switch } from 'wouter';
import QuoteFormNew from '../client/src/pages/QuoteFormNew';

export default function App() {
  return (
    <Switch>
      <Route path="/quote/new/:type?" component={QuoteFormNew} />
      <Route path="/" component={() => <div>Ana Sayfa</div>} />
    </Switch>
  );
} 