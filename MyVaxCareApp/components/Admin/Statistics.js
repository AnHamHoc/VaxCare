import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { authApi } from "../../services/API";
import { PieChart, BarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";

const screenWidth = Dimensions.get("window").width;

const Statistics = () => {
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [vaccineStats, setVaccineStats] = useState([]);
  const [currentVaccine, setCurrentVaccine] = useState("Month");
  const [currentChart, setCurrentChart] = useState("appointment");
  const [rate, setRate] = useState();

  useEffect(() => {
    fetchData();
  }, [currentChart, currentVaccine]);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get("/appointment/");
      const data = res.data;
      if (currentChart === "uservax") {
        const token = await AsyncStorage.getItem("token");
        const Detail = (await authApi(token).get("/appointmentdetail/")).data;
        const Record = (await authApi(token).get("/vaccinationrecords/")).data;
        const total = Detail.length;
        setCompletedCount(Record.length);
        setPendingCount(total);
        setRate(((Record.length / total) * 100).toFixed(2));
      } else if (currentChart === "appointment") {
        const completed = data.filter(
          (item) => item.status === "completed"
        ).length;
        const pending = data.filter((item) => item.status === "pending").length;
        setCompletedCount(completed);
        setPendingCount(pending);
      } else if (currentChart === "vaccine") {
        const completedAppointments = data.filter(
          (item) => item.status === "pending"
        );

        const filtered = completedAppointments.filter((item) => {
          const date = moment(item.created_date);
          const now = moment();

          if (currentVaccine === "Month") {
            return date.isSame(now, "month") && date.isSame(now, "year");
          } else if (currentVaccine === "Quarter") {
            const currentQuarter = Math.floor(now.month() / 3) + 1;
            const itemQuarter = Math.floor(date.month() / 3) + 1;
            return date.year() === now.year() && itemQuarter === currentQuarter;
          } else if (currentVaccine === "Year") {
            return date.isSame(now, "year");
          }
          return false;
        });
        const vaccineMap = {};
        filtered.forEach((item) => {
          if (item.vaccine_name) {
            const name = item.vaccine_name;
            vaccineMap[name] = (vaccineMap[name] || 0) + 1;
          }
        });

        const result = Object.keys(vaccineMap).map((name) => ({
          label: name,
          value: vaccineMap[name],
        }));

        setVaccineStats(result);
      }
    } catch (error) {
      console.log("Lỗi dữ liệu: ", error);
    }
  };

  const pieChartData = [
    {
      name: "Hoàn thành",
      count: completedCount,
      color: "#4CAF50",
      legendFontColor: "#333",
      legendFontSize: 15,
    },
    {
      name: "Chưa hoàn thành",
      count: pendingCount,
      color: "#F44336",
      legendFontColor: "#333",
      legendFontSize: 15,
    },
  ];
  const pieChartDataUser = [
    {
      name: "Hoàn thành",
      count: completedCount,
      color: "#4CAF50",
      legendFontColor: "#333",
      legendFontSize: 15,
    },
    {
      name: "Người Tiêm",
      count: pendingCount,
      color: "#F44336",
      legendFontColor: "#333",
      legendFontSize: 15,
    },
  ];

  const renderChart = () => {
    if (currentChart === "uservax") {
        return (
            <View>
        <>
          <PieChart
            data={pieChartDataUser}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              color: () => `rgba(0, 0, 0, 0.5)`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </>
        <Text>Tỷ lệ hoàn thành : {rate} %</Text>
      </View>
        )
      
    } else if (currentChart === "appointment") {
      return (
        <PieChart
          data={pieChartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            color: () => `rgba(0, 0, 0, 0.5)`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      );
    } else if (currentChart === "vaccine") {
      return (
        <View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                currentVaccine === "Month" && styles.activeButton,
              ]}
              onPress={() => setCurrentVaccine("Month")}
            >
              <Text style={styles.buttonText}>Tháng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                currentVaccine === "Quarter" && styles.activeButton,
              ]}
              onPress={() => setCurrentVaccine("Quarter")}
            >
              <Text style={styles.buttonText}>Quý</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                currentVaccine === "Year" && styles.activeButton,
              ]}
              onPress={() => setCurrentVaccine("Year")}
            >
              <Text style={styles.buttonText}>Năm</Text>
            </TouchableOpacity>
          </View>
          <>
            <BarChart
              data={{
                labels: vaccineStats.map((item) => item.label),
                datasets: [
                  {
                    data: vaccineStats.map((item) => item.value),
                    backgroundColor: [
                      "rgba(197, 0, 43, 0.2)",
                      "rgba(116, 99, 83, 0.2)",
                      "rgba(255, 205, 86, 0.2)",
                      "rgba(75, 192, 192, 0.2)",
                      "rgba(54, 162, 235, 0.2)",
                      "rgba(153, 102, 255, 0.2)",
                      "rgba(201, 203, 207, 0.2)",
                    ],
                  },
                ],
              }}
              width={screenWidth - 32}
              height={500}
              yAxisLabel=""
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: () => "#333",
              }}
              verticalLabelRotation={45}
              fromZero
            />
          </>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 10, paddingHorizontal: 10 }}>
      {/* Nút chọn thống kê */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            currentChart === "vaccine" && styles.activeButton,
          ]}
          onPress={() => setCurrentChart("vaccine")}
        >
          <Text style={styles.buttonText}>Vắc xin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            currentChart === "appointment" && styles.activeButton,
          ]}
          onPress={() => setCurrentChart("appointment")}
        >
          <Text style={styles.buttonText}>Lịch hẹn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            currentChart === "uservax" && styles.activeButton,
          ]}
          onPress={() => setCurrentChart("uservax")}
        >
          <Text style={styles.buttonText}>Người đã tiêm</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
          {currentChart === "vaccine"
            ? "Số người đã tiêm theo loại vắc xin"
            : currentChart === "uservax"
            ? "Thống kê người đã tiêm"
            : "Thống kê lịch hẹn"}
        </Text>
        {renderChart()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: "#1976D2",
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: "#0D47A1",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default Statistics;
