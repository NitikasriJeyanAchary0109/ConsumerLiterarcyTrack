import React, { useState } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { apiService } from "../../services/api";
import { UploadCard } from "../../components/UploadCard";

// Sample UPI dataset string (authentic Swiggy, Zomato, Rent, Tuition P2P transfers)
const SAMPLE_CSV_CONTENT = `amount,category,merchant,type,date,description
4.25,Food,Swiggy Delivery,debit,2026-07-31T10:00:00Z,UPI-Swiggy-9876543210@paytm
3.50,Food,Zomato Food,debit,2026-07-30T14:30:00Z,UPI-Zomato-1122334455@okaxis
10.00,Transport,Uber Cabs,debit,2026-07-30T09:15:00Z,UPI-UberCabs-8877665544@ybl
2.80,Food,Campus Coffee,debit,2026-07-29T08:00:00Z,UPI-CampusCoffee-998877@upi
1500.00,Bills,Apartment Rent,debit,2026-07-28T08:00:00Z,UPI-Rent-PropOwner-123456@sbi
45.00,Shopping,Amazon Retail,debit,2026-07-28T16:00:00Z,UPI-AmazonShopping-994433@paytm
25.00,Transport,Gas Station,debit,2026-07-27T11:00:00Z,UPI-GasStation-882299@okicici
15.50,Food,Burger Joint,debit,2026-07-27T19:30:00Z,UPI-Burgers-667788@ybl
12.00,Other,College Bookstore,debit,2026-07-26T10:00:00Z,UPI-Bookstore-332211@sbi
8.50,Shopping,Pharmasave,debit,2026-07-26T15:45:00Z,UPI-Pharmacy-445566@paytm
350.00,Salary,Transfer From Parent,credit,2026-07-25T12:00:00Z,UPI-Transfer-From-Parent
500.00,Bills,College Tuition,debit,2026-07-25T08:00:00Z,UPI-TuitionFee-University@sbi
5.20,Food,Campus Canteen,debit,2026-07-24T13:00:00Z,UPI-Canteen-556677@upi
20.00,Other,Cinema Tickets,debit,2026-07-24T20:00:00Z,UPI-Tickets-ShowTime@paytm
65.00,Bills,Wifi Bill,debit,2026-07-23T10:00:00Z,UPI-InternetBill-Broadband@okaxis
14.80,Food,Pizza Slice,debit,2026-07-22T21:00:00Z,UPI-PizzaCorner-8877@ybl
1200.00,Salary,Part-time Internship,credit,2026-07-20T17:00:00Z,UPI-Salary-InternshipCorp@sbi
35.00,Transport,Train Ticket,debit,2026-07-19T07:30:00Z,UPI-MetroTicket-Rail@okicici
8.90,Food,Grocery Express,debit,2026-07-19T18:00:00Z,UPI-Groceries-Supermart@paytm
6.50,Food,Juice Bar,debit,2026-07-18T15:00:00Z,UPI-JuiceBar-112233@okaxis
3.20,Food,Donut shop,debit,2026-07-18T09:00:00Z,UPI-Donuts-443322@ybl
18.50,Shopping,Target Store,debit,2026-07-17T14:00:00Z,UPI-TargetRetail-556677@paytm
4.50,Food,Campus Coffee,debit,2026-07-16T08:30:00Z,UPI-CampusCoffee-998877@upi
22.00,Bills,Mobile Recharge,debit,2026-07-15T12:00:00Z,UPI-MobileRecharge-Telco@sbi
15.00,Other,Laundry Service,debit,2026-07-14T11:00:00Z,UPI-CleanLaundry-8877@okaxis
30.00,Transport,Gas Station,debit,2026-07-13T16:00:00Z,UPI-GasStation-882299@okicici
12.50,Food,Noodle Bar,debit,2026-07-12T19:00:00Z,UPI-Noodles-667788@ybl
50.00,Other,P2P Roommate Split,credit,2026-07-11T13:00:00Z,UPI-P2P-RoommateTransfer
7.20,Food,Swiggy Dessert,debit,2026-07-10T20:30:00Z,UPI-Swiggy-9876543210@paytm
11.40,Shopping,Convenience Store,debit,2026-07-09T22:00:00Z,UPI-StoreExpress-8899@upi
4.25,Food,Swiggy Lunch,debit,2026-07-08T13:00:00Z,UPI-Swiggy-9876543210@paytm
25.00,Other,Gift Store,debit,2026-07-07T15:00:00Z,UPI-GiftCorner-5544@paytm
100.00,Savings,Transfer to Savings,debit,2026-07-05T09:00:00Z,UPI-TransferToSavings-Goal@sbi
8.00,Transport,Metro Card Topup,debit,2026-07-04T08:00:00Z,UPI-MetroSmartCard-Topup
9.50,Food,Campus Canteen,debit,2026-07-03T12:00:00Z,UPI-Canteen-556677@upi`;

export const BankConnectScreen = ({ navigation }: { navigation: any }) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectFile = async () => {
    setErrorMsg(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/comma-separated-values", "text/csv"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (e: any) {
      const detail = e?.message || String(e);
      setErrorMsg("Failed to open file picker: " + detail);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setErrorMsg(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "text/csv",
      } as any);

      const response = await apiService.uploadStatement(formData);
      
      Alert.alert(
        "Import Successful",
        `${response.message || "Your bank statement was successfully parsed."}`,
        [{ text: "OK", onPress: () => navigation.navigate("TransactionList") }]
      );
      setSelectedFile(null);
    } catch (error: any) {
      const detail = error.response?.data?.detail || error.message || "Parsing failed.";
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDemo = async () => {
    setErrorMsg(null);
    setLoadingDemo(true);
    try {
      // 1. Write the demo CSV content to a local temporary cache file
      const demoPath = FileSystem.cacheDirectory + "sample_transactions.csv";
      await FileSystem.writeAsStringAsync(demoPath, SAMPLE_CSV_CONTENT, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 2. Wrap cache file in a Form payload
      const formData = new FormData();
      formData.append("file", {
        uri: demoPath,
        name: "sample_transactions.csv",
        type: "text/csv",
      } as any);

      // 3. Upload to transactions parser endpoint
      const response = await apiService.uploadStatement(formData);

      Alert.alert(
        "Demo Connected",
        `UPI Statement imported! ${response.message || ""}`,
        [{ text: "View Transactions", onPress: () => navigation.navigate("TransactionList") }]
      );
    } catch (error: any) {
      const detail = error.response?.data?.detail || error.message || "Demo loading failed.";
      setErrorMsg(detail);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-grow px-4 pt-4">
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            UPI & Banking Interface
          </Text>
          <Text className="text-slate-100 text-2xl font-black">Link Bank Account</Text>
        </View>

        {errorMsg && (
          <View className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl mb-4">
            <Text className="text-red-400 text-xs font-semibold leading-relaxed mb-2">
              ⚠️ Error: {errorMsg}
            </Text>
            <TouchableOpacity 
              onPress={() => setErrorMsg(null)}
              className="bg-red-500/20 py-1.5 px-3 rounded-lg self-start"
            >
              <Text className="text-red-400 text-[10px] font-bold uppercase">Clear Error</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Option A: Upload Custom CSV */}
        <UploadCard
          title="Upload Bank Statement"
          description="Upload a CSV export of your UPI transactions statement from your bank application. Make sure columns match: amount, category, description, date."
          buttonText={selectedFile ? "Upload Selected Statement" : "Browse Files (.csv)"}
          onPress={selectedFile ? handleUploadFile : handleSelectFile}
          loading={loading}
          disabled={loadingDemo}
          accentColor="#6366f1"
        >
          {selectedFile && (
            <View className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl flex-row justify-between items-center">
              <View className="flex-1 pr-3">
                <Text className="text-slate-200 text-xs font-semibold" numberOfLines={1}>
                  📄 {selectedFile.name}
                </Text>
                <Text className="text-slate-500 text-[10px] mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFile(null)}>
                <Text className="text-red-400 text-xs font-bold px-2">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </UploadCard>

        {/* Option B: Use Bundled Demo Data */}
        <UploadCard
          title="Use Demo Data"
          description="Don't have a statement handy? Tapping here connects a simulated UPI account prepopulated with 35 realistic college student purchases (Swiggy, Zomato, rent, and utility swipes)."
          buttonText="Instantly Connect Demo Bank"
          onPress={handleUploadDemo}
          loading={loadingDemo}
          disabled={loading}
          accentColor="#10b981"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BankConnectScreen;
