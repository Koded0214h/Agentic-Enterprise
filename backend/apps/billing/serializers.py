from rest_framework import serializers
from .models import UsageRecord, DepartmentCostCenter, AgentBudget

class DepartmentCostCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentCostCenter
        fields = '__all__'

class UsageRecordSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = UsageRecord
        fields = '__all__'

class AgentBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentBudget
        fields = '__all__'
