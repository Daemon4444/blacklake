import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, Spin } from "antd";
import zhCN from "antd/locale/zh_CN";
import { ErrorBoundary } from "./components/ErrorBoundary";

const SaaSLayout = lazy(() => import("./layouts/SaaSLayout"));
const Home = lazy(() => import("./pages/website/Home"));
const Login = lazy(() => import("./pages/website/Login"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Orders = lazy(() => import("./pages/orders"));
const OrderDetail = lazy(() => import("./pages/orders/Detail"));
const Production = lazy(() => import("./pages/production"));
const Quality = lazy(() => import("./pages/quality"));
const Materials = lazy(() => import("./pages/materials"));
const Equipment = lazy(() => import("./pages/equipment"));
const Process = lazy(() => import("./pages/process"));
const Kanban = lazy(() => import("./pages/kanban"));
const Intelligence = lazy(() => import("./pages/intelligence"));
const Commercial = lazy(() => import("./pages/commercial"));
const Implementation = lazy(() => import("./pages/implementation"));
const Platform = lazy(() => import("./pages/platform"));
const Admin = lazy(() => import("./pages/admin"));

const Loading = () => <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><Spin size="large" /></div>;

function LazyPage({ children, label }: { children: React.ReactNode; label: string }) {
  return <ErrorBoundary fallbackLabel={label}><Suspense fallback={<Spin style={{ margin: 40 }} />}>{children}</Suspense></ErrorBoundary>;
}

export default function App() {
  return (
    <ErrorBoundary fallbackLabel="应用">
      <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: "#02b980", borderRadius: 6 } }}>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<LazyPage label="首页"><Home /></LazyPage>} />
              <Route path="/login" element={<LazyPage label="登录"><Login /></LazyPage>} />
              <Route path="/app" element={<LazyPage label="工作台"><SaaSLayout /></LazyPage>}>
                <Route index element={<LazyPage label="总览"><Dashboard /></LazyPage>} />
                <Route path="orders" element={<LazyPage label="订单"><Orders /></LazyPage>} />
                <Route path="orders/:id" element={<LazyPage label="工单详情"><OrderDetail /></LazyPage>} />
                <Route path="production" element={<LazyPage label="生产"><Production /></LazyPage>} />
                <Route path="quality" element={<LazyPage label="质量"><Quality /></LazyPage>} />
                <Route path="materials" element={<LazyPage label="物料"><Materials /></LazyPage>} />
                <Route path="equipment" element={<LazyPage label="设备"><Equipment /></LazyPage>} />
                <Route path="process" element={<LazyPage label="工艺"><Process /></LazyPage>} />
                <Route path="kanban" element={<LazyPage label="看板"><Kanban /></LazyPage>} />
                <Route path="intelligence" element={<LazyPage label="智能"><Intelligence /></LazyPage>} />
                <Route path="commercial" element={<LazyPage label="商业化"><Commercial /></LazyPage>} />
                <Route path="implementation" element={<LazyPage label="实施"><Implementation /></LazyPage>} />
                <Route path="platform" element={<LazyPage label="平台"><Platform /></LazyPage>} />
                <Route path="admin" element={<LazyPage label="管理"><Admin /></LazyPage>} />
              </Route>
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
