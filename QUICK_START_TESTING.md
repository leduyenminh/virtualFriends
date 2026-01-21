# Quick Start Guide - High Priority Features Testing

## 📋 Prerequisites

- Node.js 14+ with npm
- Java 17 + Maven 3.9
- Docker (optional, for containerized testing)
- Git (already configured)

---

## 🚀 Quick Start (5 minutes)

### 1. Install Frontend Dependencies
```bash
cd ui
npm install --legacy-peer-deps
```
**Expected Output**: 
```
270 packages installed
9 vulnerabilities (3 moderate, 6 high) - acceptable for dev
```

### 2. Run Unit Tests (1 minute)
```bash
npm test -- --testPathPattern="HighPriorityFeatures" --watchAll=false
```
**Expected Output**:
```
✅ Test Suites: 1 passed
✅ Tests: 42 passed, 42 total
✅ Time: ~1.83s
```

### 3. Build Frontend for Production
```bash
npm run build
```
**Expected Output**:
```
✅ The build folder is ready to be deployed
✅ Main bundle: 215.88 kB (gzipped)
✅ CSS: 3.04 kB
✅ Chunk: 1.75 kB
```

### 4. Build Backend Services
```bash
cd ../AvatarService
mvn clean package -DskipTests -q

cd ../AgentService
mvn clean package -DskipTests -q
```
**Expected Output**: No errors, JAR files created

---

## 🧪 Testing Phases

### Phase 1: Unit Tests (✅ COMPLETE)
```bash
cd ui
npm test -- --testPathPattern="HighPriorityFeatures" --watchAll=false
```

**Tests Included**:
- 7 Animation System tests
- 8 Customization tests
- 9 Chat Reaction tests
- 6 Context Manager tests
- 6 Emotion Detection tests
- 6 Error Handler tests

**Status**: ✅ 42/42 PASSED (1.83s)

---

### Phase 2: Local Integration (Optional)

#### Start Backend Services
```bash
# Terminal 1: Start AvatarService
cd AvatarService
mvn spring-boot:run

# Terminal 2: Start AgentService
cd AgentService
mvn spring-boot:run

# Terminal 3: Start Gateway (optional)
cd Gateway
mvn spring-boot:run
```

#### Start Frontend Dev Server
```bash
# Terminal 4: Start React dev server
cd ui
npm start
```

**Access Points**:
- Frontend: http://localhost:3000
- AvatarService: http://localhost:8083
- AgentService: http://localhost:8080
- Gateway: http://localhost:8081

---

### Phase 3: Docker Testing (Optional)

#### Build Docker Images
```bash
docker-compose build
```

#### Start Services in Docker
```bash
docker-compose up
```

#### Check Service Health
```bash
docker ps
docker logs <container-id>
```

---

## 🎯 Feature Testing Checklist

### Avatar Animation System
- [ ] Wave gesture triggers animation
- [ ] Nod gesture triggers animation
- [ ] Jump gesture triggers animation
- [ ] Idle animation plays every 3 seconds
- [ ] Animation keyframes interpolate smoothly

### Avatar Customization
- [ ] Skin color selector works
- [ ] Hair color selector works
- [ ] Expression selector works
- [ ] Customization preview updates in real-time
- [ ] Customization saves to localStorage

### Voice-Avatar Sync
- [ ] Voice button records audio
- [ ] Lip sync animates during playback
- [ ] Voice playback completes
- [ ] No audio glitches

### Chat Reactions
- [ ] "Hello!" triggers greeting reaction
- [ ] "Thank you!" triggers appreciation
- [ ] "!!!" triggers excitement
- [ ] Sad message triggers sad gesture
- [ ] Context tracking works across messages

### Error Handling
- [ ] Invalid files show error messages
- [ ] Form validation shows field errors
- [ ] Network errors handled gracefully
- [ ] Error messages are user-friendly

---

## 📊 Verification Commands

### Check All Builds Pass
```bash
# Frontend
cd ui && npm run build

# Backend services
cd AvatarService && mvn clean package -DskipTests -q
cd AgentService && mvn clean package -DskipTests -q
cd AuthService && mvn clean package -DskipTests -q
cd Gateway && mvn clean package -DskipTests -q
```

### Run All Tests
```bash
cd ui
npm test -- --watchAll=false
```

### Check Production Bundle Size
```bash
cd ui
npm run build
du -sh build/
# Expected: ~500KB uncompressed (215.88 KB gzipped)
```

### Check for Errors
```bash
# ESLint
npm run lint

# TypeScript (if available)
npm run check-types
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**:
```bash
cd ui
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: Port already in use
**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=4000 npm start
```

### Issue: Java compilation errors
**Solution**:
```bash
# Clean all builds
mvn clean -DskipTests

# Rebuild
mvn package -DskipTests -q
```

### Issue: Test timeout
**Solution**:
```bash
# Run with longer timeout
npm test -- --testTimeout=10000 --watchAll=false
```

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Main Bundle | < 250 KB | ✅ 215.88 KB |
| CSS Bundle | < 5 KB | ✅ 3.04 KB |
| Test Pass Rate | 100% | ✅ 100% (42/42) |
| Test Duration | < 5s | ✅ 1.83s |
| Animation FPS | > 30 | ⏳ TBD (local test) |

---

## 🔄 Development Workflow

### Making Changes
```bash
# 1. Make code changes
# 2. Run tests to verify
npm test -- --watchAll=false

# 3. Rebuild frontend
npm run build

# 4. Rebuild backend (if changed)
mvn clean package -DskipTests -q
```

### Testing Changes Locally
```bash
# Terminal 1: Frontend dev server
npm start

# Terminal 2: Run tests in watch mode
npm test

# Open http://localhost:3000 to test UI
```

---

## 📚 Documentation

- **Test Results**: [TEST_RESULTS.md](./TEST_RESULTS.md)
- **Implementation Details**: [HELP.md](./HELP.md)
- **High Priority Roadmap**: [IMPROVEMENT_ROADMAP.md](./IMPROVEMENT_ROADMAP.md)
- **Live2D Integration**: [LIVE2D_INTEGRATION.md](./LIVE2D_INTEGRATION.md)

---

## 🎓 Understanding the Test Files

### Location
```
ui/src/services/__tests__/HighPriorityFeatures.test.js
```

### Test Organization
Each major feature has its own `describe()` block:

```javascript
describe('AvatarAnimationLibrary', () => {
  // Tests for animation system
})

describe('AvatarCustomizer', () => {
  // Tests for customization
})

describe('ChatReactionAnalyzer', () => {
  // Tests for reactions
})

// ... etc
```

### Adding New Tests
```javascript
test('should do something specific', () => {
  // 1. Arrange
  const library = new AvatarAnimationLibrary();
  
  // 2. Act
  const animation = library.getAnimation('gesture', 'wave');
  
  // 3. Assert
  expect(animation).toBeDefined();
});
```

---

## ✨ What Was Tested

### Unit Tests (42 tests)
- ✅ Animation library initialization
- ✅ Gesture/emotion animation mapping
- ✅ Keyframe interpolation
- ✅ Customization options (21 colors, 5 outfits, 14 accessories, 7 expressions, 5 effects)
- ✅ Customization validation
- ✅ Chat reaction analysis (11 types, 100+ keywords)
- ✅ Conversation context tracking
- ✅ Emotion detection with confidence scoring
- ✅ Error message generation
- ✅ Input field validation

### Build Tests
- ✅ Maven compilation (4 backend services)
- ✅ npm dependency installation (270 packages)
- ✅ React production build
- ✅ Bundle size optimization
- ✅ No syntax errors in code

---

## 🚢 Deployment Checklist

- [ ] All unit tests passing (42/42)
- [ ] Production build successful (215.88 KB)
- [ ] No ESLint errors
- [ ] Backend services compile
- [ ] Docker images build successfully
- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Monitoring/logging configured

---

## 📞 Support

For detailed implementation information, see:
- Backend code: `AvatarService/src/main/java/`
- Frontend code: `ui/src/services/` and `ui/src/components/`
- Tests: `ui/src/services/__tests__/`

---

**Status**: ✅ All tests passing, ready for integration testing and deployment
**Last Updated**: 2024
**Next Phase**: Local integration testing → Docker deployment → Cloud deployment
