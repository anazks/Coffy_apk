import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchProfile, getRole, getStores } from '../Api/Services/Users';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [roleData, setRoleData] = useState(null);
  const [storesData, setStoresData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch all APIs in parallel
      const [profileRes, roleRes, storeRes] = await Promise.all([
        fetchProfile(), 
        getRole(), 
        getStores()
      ]);

      if (profileRes.data && profileRes.status === 200) {
        setProfile(profileRes.data);
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }

      if (roleRes) {
        setRoleData(roleRes);
      } else {
        Alert.alert('Error', 'Failed to load role data');
      }
      
      console.log(storeRes, "store from backend");
      
      // Handle array response for stores
      if (storeRes && Array.isArray(storeRes) && storeRes.length > 0) {
        setStoresData(storeRes);
      } else if (storeRes && storeRes.data && Array.isArray(storeRes.data) && storeRes.data.length > 0) {
        setStoresData(storeRes.data);
      } else {
        console.log('No stores found or failed to load store data');
        setStoresData([]);
      }
    } catch (error) {
      console.log('Profile/Role/Store Fetch Error:', error);
      Alert.alert('Error', 'Something went wrong while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InfoRow = ({ label, value, isLast = false }) => (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );

  const StatusBadge = ({ isActive, label }) => (
    <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
      <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
        {label || (isActive ? 'Active' : 'Inactive')}
      </Text>
    </View>
  );

  const LicenseBadge = ({ isValid, daysRemaining }) => {
    const isExpiringSoon = daysRemaining <= 30;
    const badgeStyle = isValid 
      ? (isExpiringSoon ? styles.warningBadge : styles.successBadge)
      : styles.dangerBadge;
    const textStyle = isValid 
      ? (isExpiringSoon ? styles.warningText : styles.successText)
      : styles.dangerText;
    
    let label = 'Invalid';
    if (isValid) {
      if (isExpiringSoon) {
        label = `${daysRemaining} days left`;
      } else {
        label = `Valid (${daysRemaining} days)`;
      }
    }

    return (
      <View style={[styles.statusBadge, badgeStyle]}>
        <Text style={[styles.statusText, textStyle]}>{label}</Text>
      </View>
    );
  };

  const renderStoreCard = (storeData, index) => (
    <View key={storeData.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Store Information</Text>
          {storesData.length > 1 && (
            <Text style={styles.storeCounter}>Store {index + 1} of {storesData.length}</Text>
          )}
        </View>
        <StatusBadge isActive={storeData.is_active} label={storeData.status} />
      </View>
      
      <View style={styles.cardContent}>
        <InfoRow label="Store Name" value={storeData.name} />
        <InfoRow label="Store Code" value={storeData.store_code} />
        <InfoRow label="Owner Name" value={storeData.owner_name} />
        <InfoRow label="Business Type" value={storeData.business_type} />
        <InfoRow label="Currency" value={storeData.currency} />
        <InfoRow label="Timezone" value={storeData.timezone} />
        <InfoRow label="Total Users" value={storeData.total_users?.toString()} />
        <InfoRow label="Total Branches" value={storeData.total_branches?.toString()} />
        <InfoRow label="Created" value={formatDate(storeData.created_at)} isLast={true} />
      </View>
    </View>
  );

  const renderLicenseCard = (storeData, index) => (
    <View key={`license-${storeData.id}`} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Subscription & License</Text>
          {storesData.length > 1 && (
            <Text style={styles.storeCounter}>{storeData.name}</Text>
          )}
        </View>
        <LicenseBadge 
          isValid={storeData.license_info.is_valid} 
          daysRemaining={storeData.license_info.days_remaining}
        />
      </View>
      
      <View style={styles.cardContent}>
        <InfoRow label="Subscription Plan" value={storeData.subscription_plan} />
        <InfoRow 
          label="Subscription Status" 
          value={storeData.is_subscription_active ? 'Active' : 'Inactive'} 
        />
        <InfoRow 
          label="Subscription Expires" 
          value={formatDate(storeData.subscription_expires_at)} 
        />
        <InfoRow label="License Key" value={storeData.license_info.license_key} />
        <InfoRow label="License Type" value={storeData.license_info.license_type} />
        <InfoRow label="Issued To" value={storeData.license_info.issued_to} />
        <InfoRow label="Max Users" value={storeData.license_info.max_users?.toString()} />
        <InfoRow label="Max Branches" value={storeData.license_info.max_branches?.toString()} />
        <InfoRow label="Issued At" value={formatDate(storeData.license_info.issued_at)} />
        <InfoRow 
          label="License Expires" 
          value={formatDate(storeData.license_info.expires_at)} 
          isLast={true}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Profile Unavailable</Text>
        <Text style={styles.errorText}>No profile data available at this time</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Profile Overview</Text>
        <Text style={styles.pageSubtitle}>Personal information and account details</Text>
      </View>

      {/* Personal Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <StatusBadge isActive={profile.is_active} />
        </View>
        
        <View style={styles.cardContent}>
          <InfoRow label="Full Name" value={profile.full_name} />
          <InfoRow label="Email Address" value={profile.email} />
          <InfoRow label="Phone Number" value={profile.phone} />
          <InfoRow label="Last Login" value={formatDate(profile.last_login_at)} isLast={true} />
        </View>
      </View>

      {/* Multiple Stores Information */}
      {storesData.length > 0 && storesData.map((storeData, index) => renderStoreCard(storeData, index))}

      {/* Multiple Stores Subscription & License */}
      {storesData.length > 0 && storesData.map((storeData, index) => 
        storeData.license_info && renderLicenseCard(storeData, index)
      )}

      {/* Role Information */}
      {roleData && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Role Details</Text>
          </View>
          
          <View style={styles.cardContent}>
            <InfoRow label="Role" value={roleData.role} />
            <InfoRow label="Store Name" value={roleData.store?.name} />
            <InfoRow label="Business Type" value={roleData.store?.business_type} />
            <InfoRow label="Subscription Plan" value={roleData.store?.subscription_plan} isLast={true} />
          </View>
        </View>
      )}

      {/* Branch Assignments */}
      {roleData?.assigned_branches && roleData.assigned_branches.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Branch Assignments</Text>
          </View>
          
          <View style={styles.cardContent}>
            {roleData.assigned_branches.map((branch, index) => (
              <InfoRow
                key={branch.id}
                label={branch.name}
                value={branch.role}
                isLast={index === roleData.assigned_branches.length - 1}
              />
            ))}
          </View>
        </View>
      )}

      {/* No Stores Message */}
      {storesData.length === 0 && (
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.noDataText}>No stores found for this user</Text>
          </View>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardTitleContainer: {
    flex: 1,
  },
  storeCounter: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
    marginRight: 16,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1.5,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeText: {
    color: '#166534',
  },
  inactiveText: {
    color: '#DC2626',
  },
  successBadge: {
    backgroundColor: '#DCFCE7',
  },
  successText: {
    color: '#166534',
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
  },
  warningText: {
    color: '#92400E',
  },
  dangerBadge: {
    backgroundColor: '#FEE2E2',
  },
  dangerText: {
    color: '#DC2626',
  },
  noDataText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 20,
  },
});